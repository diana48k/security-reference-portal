import { NextRequest } from "next/server";
import { z } from "zod";
import {
  identity,
  jsonBody,
  loadSettings,
  sameOrigin,
  staffUser,
  takeQuota,
} from "@/src/lib/assistant/server";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
const schema = z.object({
  category: z.enum([
    "feature_request",
    "content_gap",
    "bug",
    "technical_review",
    "sales_lead",
    "rating",
  ]),
  details: z.string().trim().min(2).max(2000),
  consent: z.literal(true),
  contact: z
    .object({
      name: z.string().min(1).max(100),
      company: z.string().max(100),
      channel: z.string().min(5).max(150),
      province: z.string().max(100),
    })
    .optional(),
  conversationId: z.string().uuid().optional(),
  attachTranscript: z.boolean().default(false),
});
export async function POST(req: NextRequest) {
  if (!sameOrigin(req))
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const p = schema.safeParse(await jsonBody(req));
    if (!p.success)
      return Response.json(
        { error: "กรุณาตรวจข้อมูลและยืนยันการส่ง" },
        { status: 400 },
      );
    const s = await loadSettings(),
      who = identity(req),
      staff = await staffUser(),
      owner = staff ? `user:${staff.id}` : who.owner,
      db = createSupabaseAdminClient();
    if (!s.enabled || (!staff && !s.publicEnabled))
      return Response.json({ error: "Unavailable" }, { status: 503 });
    if (!(await takeQuota(`feedback:${who.network}`, 5, 3600)))
      return Response.json({ error: "กรุณาลองใหม่ภายหลัง" }, { status: 429 });
    if (
      p.data.category === "sales_lead" &&
      (!s.leadEnabled || !s.privacyUrl || !s.companyContact || !p.data.contact)
    )
      return Response.json(
        { error: "แบบฟอร์มติดต่อยังไม่พร้อม" },
        { status: 400 },
      );
    let transcript = null;
    if (p.data.attachTranscript && p.data.conversationId) {
      const { data: c } = await db
        .from("assistant_conversations")
        .select("id")
        .eq("id", p.data.conversationId)
        .eq("owner_hash", owner)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();
      if (!c) return Response.json({ error: "Not found" }, { status: 404 });
      const { data } = await db
        .from("assistant_messages")
        .select("question,answer")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(4);
      transcript = data;
    }
    const { error } = await db
      .from("assistant_feedback")
      .insert({
        owner_hash: owner,
        category: p.data.category,
        details: p.data.details,
        contact: p.data.category === "sales_lead" ? p.data.contact : null,
        transcript,
      });
    if (error) throw error;
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "ยังส่งไม่สำเร็จ กรุณาลองใหม่" },
      { status: 503 },
    );
  }
}
