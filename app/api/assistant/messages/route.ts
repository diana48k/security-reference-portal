import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  identity,
  jsonBody,
  loadSettings,
  sameOrigin,
  searchSources,
  staffUser,
  takeQuota,
} from "@/src/lib/assistant/server";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { providers } from "@/src/lib/assistant/provider";
import { publicQuestion, unsafeQuestion } from "@/src/lib/assistant/config";

export const maxDuration = 60;
const schema = z.object({
  conversationId: z.string().uuid().optional(),
  clientMessageId: z.string().uuid(),
  text: z.string().trim().min(1).max(1000),
  searchOnly: z.boolean().default(false),
  captchaToken: z.string().max(4096).optional(),
});
export async function POST(req: NextRequest) {
  if (!sameOrigin(req))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const parsed = schema.safeParse(await jsonBody(req));
    if (!parsed.success)
      return NextResponse.json({ error: "ข้อความไม่ถูกต้อง" }, { status: 400 });
    const input = parsed.data,
      s = await loadSettings(),
      who = identity(req),
      staff = await staffUser();
    if (!s.enabled || (!staff && !s.publicEnabled))
      return NextResponse.json(
        { error: "ผู้ช่วยยังไม่เปิดใช้งาน" },
        { status: 503 },
      );
    const owner = staff ? `user:${staff.id}` : who.owner;
    if (!(await takeQuota(`burst:${who.network}`, 60, 600)))
      return NextResponse.json(
        { error: "กรุณารอสักครู่แล้วลองใหม่" },
        { status: 429 },
      );
    const db = createSupabaseAdminClient();
    let conversationId = input.conversationId;
    if (conversationId) {
      const { data } = await db
        .from("assistant_conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("owner_hash", owner)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();
      if (!data)
        return NextResponse.json(
          { error: "ไม่พบบทสนทนา กรุณาเริ่มใหม่" },
          { status: 404 },
        );
    } else {
      const { data, error } = await db
        .from("assistant_conversations")
        .insert({
          owner_hash: owner,
          user_id: staff?.id,
          expires_at: new Date(
            Date.now() +
              86400000 * (staff ? s.staffRetentionDays : s.publicRetentionDays),
          ).toISOString(),
        })
        .select("id")
        .single();
      if (error) throw error;
      conversationId = data.id;
    }
    const { data: existing } = await db
      .from("assistant_messages")
      .select("*")
      .eq("id", input.clientMessageId)
      .eq("owner_hash", owner)
      .eq("conversation_id", conversationId)
      .maybeSingle();
    if (existing && existing.question !== input.text)
      return NextResponse.json(
        { error: "Message ID นี้ถูกใช้กับข้อความอื่นแล้ว" },
        { status: 409 },
      );
    if (existing?.status === "pending")
      return NextResponse.json(
        { error: "กำลังตอบคำถามนี้ กรุณารอสักครู่" },
        { status: 409 },
      );
    if (existing)
      return NextResponse.json({
        conversationId,
        message: {
          id: existing.id,
          role: "assistant",
          text: existing.answer,
          sources: existing.sources,
          fallback: existing.status === "fallback",
        },
      });
    const daily = await takeQuota(
      `day:${owner}:${new Date().toISOString().slice(0, 10)}`,
      staff ? s.staffDailyLimit : s.publicDailyLimit,
      86400,
    );
    if (
      !staff &&
      s.captcha &&
      !input.searchOnly &&
      !(await takeQuota(`challenge:${who.network}`, 5, 600))
    ) {
      if (!input.captchaToken || !process.env.TURNSTILE_SECRET_KEY)
        return NextResponse.json(
          {
            error: "กรุณายืนยันก่อนใช้ AI ต่อ หรือเลือกค้นข้อมูล",
            challenge: true,
            siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
          },
          { status: 428 },
        );
      const verify = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: new URLSearchParams({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: input.captchaToken,
          }),
          signal: AbortSignal.timeout(8000),
        },
      );
      const result = await verify.json();
      if (!result.success || result.hostname !== new URL(req.url).hostname)
        return NextResponse.json({ error: "ยืนยันไม่สำเร็จ" }, { status: 403 });
    }
    // Public free service receives no personal question or prior transcript.
    if (!publicQuestion(input.text))
      return NextResponse.json(
        {
          error:
            "กรุณาลบเบอร์โทร อีเมล และข้อมูลส่วนบุคคลออกจากข้อความ ใช้แบบฟอร์มติดต่อฝ่ายขายแทน",
        },
        { status: 400 },
      );
    await db
      .from("assistant_messages")
      .update({
        status: "failed",
        answer: "การตอบครั้งก่อนหยุดลง กรุณาถามใหม่",
      })
      .eq("conversation_id", conversationId)
      .eq("owner_hash", owner)
      .eq("status", "pending")
      .lt("created_at", new Date(Date.now() - 120000).toISOString());
    const { error: lockError } = await db
      .from("assistant_messages")
      .insert({
        id: input.clientMessageId,
        conversation_id: conversationId,
        owner_hash: owner,
        question: input.text,
        model: s.model,
      });
    if (lockError)
      return NextResponse.json(
        { error: "มีคำตอบกำลังประมวลผล กรุณารอสักครู่" },
        { status: 409 },
      );
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const emit = (event: string, data: unknown) => {
          try {
            controller.enqueue(
              encoder.encode(
                `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
              ),
            );
          } catch {
            /* observer disconnected */
          }
        };
        emit("session", { conversationId });
        const start = Date.now();
        let answer =
          "ไม่พบข้อมูลอ้างอิงที่ตรงคำถาม ลองระบุประเภทระบบ ประตู หรือปัญหาที่ต้องการ หรือส่งข้อเสนอแนะให้ทีมงานครับ";
        let fallback = true,
          inputTokens = 0,
          outputTokens = 0;
        let sources: Awaited<ReturnType<typeof searchSources>> = [];
        try {
          if (unsafeQuestion(input.text))
            answer =
              "ผมช่วยแนะนำการป้องกันและการติดตั้งที่ได้รับอนุญาตได้ครับ กรุณาติดต่อทีมเทคนิคสำหรับการเข้าถึงหรือแก้ไขระบบรักษาความปลอดภัย";
          else {
            sources = await searchSources(input.text, s);
            if (sources.length) {
              answer =
                "ผลค้นหาจากข้อมูลเผยแพร่ในระบบ:\n" +
                sources
                  .map(
                    (source, i) =>
                      `[${i + 1}] ${source.title}\n${source.excerpt.slice(0, 350)}`,
                  )
                  .join("\n\n");
              if (daily && !input.searchOnly) {
                emit("sources", sources);
                const result = await providers[s.provider].answer(
                  s,
                  input.text,
                  sources,
                  AbortSignal.any([req.signal, AbortSignal.timeout(25000)]),
                  (delta) => emit("delta", { text: delta }),
                );
                answer = result.text;
                inputTokens = result.inputTokens;
                outputTokens = result.outputTokens;
                fallback = false;
              }
            }
          }
        } catch {
          /* deterministic source search remains usable when provider fails */
        }
        const { error: saveError } = await db
          .from("assistant_messages")
          .update({
            answer,
            sources,
            status: fallback ? "fallback" : "done",
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            latency_ms: Date.now() - start,
            completed_at: new Date().toISOString(),
          })
          .eq("id", input.clientMessageId);
        if (saveError) emit("error", { error: "บันทึกคำตอบไม่สำเร็จ" });
        else
          emit("done", {
            conversationId,
            message: {
              id: input.clientMessageId,
              role: "assistant",
              text: answer,
              sources,
              fallback,
            },
          });
        try {
          controller.close();
        } catch {}
      },
    });
    const response = new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "X-Accel-Buffering": "no",
      },
    });
    response.cookies.set("assistant_visitor", who.cookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 86400 * 7,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return NextResponse.json(
      { error: "ระบบไม่พร้อมใช้งานชั่วคราว กรุณาใช้หน้าค้นหางานติดตั้ง" },
      { status: 503 },
    );
  }
}
