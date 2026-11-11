"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/src/lib/queries/admin";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { avatarStates, settingsSchema } from "@/src/lib/assistant/config";
import { providers } from "@/src/lib/assistant/provider";

export async function saveAssistantSettings(form: FormData) {
  const { user, profile } = await getCurrentAdminUser();
  if (profile.role !== "admin") throw new Error("Admin only");
  const config = settingsSchema.parse(JSON.parse(String(form.get("config"))));
  if (config.leadEnabled && (!config.companyContact || !config.privacyUrl))
    throw new Error("กรอก Privacy URL และช่องทางบริษัทก่อนเปิด Lead");
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("assistant_settings")
    .insert({ config, actor_id: user.id })
    .select("id")
    .single();
  if (error) throw new Error("บันทึกไม่สำเร็จ ตรวจ migration");
  if (form.get("publish") === "yes") {
    const { error } = await db.rpc("assistant_publish", { p_id: data.id });
    if (error) throw new Error("Publish failed");
  }
  revalidatePath("/admin/assistant");
  redirect("/admin/assistant?saved=1");
}
export async function publishAssistantVersion(form: FormData) {
  const { profile, user } = await getCurrentAdminUser();
  if (profile.role !== "admin") throw new Error("Admin only");
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("assistant_settings")
    .select("config")
    .eq("id", String(form.get("id")))
    .single();
  const config = settingsSchema.parse(data?.config);
  const { data: version, error: insertError } = await db
    .from("assistant_settings")
    .insert({ config, actor_id: user.id })
    .select("id")
    .single();
  if (insertError) throw new Error("Version failed");
  const { error } = await db.rpc("assistant_publish", { p_id: version.id });
  if (error) throw new Error("Publish failed");
  revalidatePath("/admin/assistant");
}
export async function updateAssistantFeedback(form: FormData) {
  await getCurrentAdminUser();
  const status = String(form.get("status"));
  if (!["new", "in_progress", "resolved", "rejected"].includes(status))
    throw new Error("Invalid status");
  const assignee = String(form.get("assignee") ?? "");
  const db = createSupabaseAdminClient();
  if (assignee) {
    const { data } = await db
      .from("profiles")
      .select("id")
      .eq("id", assignee)
      .eq("is_active", true)
      .in("role", ["admin", "tech"])
      .maybeSingle();
    if (!data) throw new Error("Invalid assignee");
  }
  const { error } = await db
    .from("assistant_feedback")
    .update({
      status,
      assignee_id: assignee || null,
      resolution_note: String(form.get("note") ?? "").slice(0, 2000),
      closed_at: ["resolved", "rejected"].includes(status)
        ? new Date().toISOString()
        : null,
    })
    .eq("id", String(form.get("id")));
  if (error) throw new Error("Update failed");
  revalidatePath("/admin/assistant/inbox");
}
export async function deleteAssistantFeedback(form: FormData) {
  const { profile } = await getCurrentAdminUser();
  if (profile.role !== "admin") throw new Error("Admin only");
  const { error } = await createSupabaseAdminClient()
    .from("assistant_feedback")
    .delete()
    .eq("id", String(form.get("id")));
  if (error) throw new Error("Delete failed");
  revalidatePath("/admin/assistant/inbox");
}
export async function testAssistant(config: unknown) {
  await getCurrentAdminUser();
  const s = settingsSchema.parse(config);
  try {
    const result = await providers[s.provider].answer(
      s,
      "ระบบนี้ช่วยอะไรได้บ้าง",
      [
        {
          id: "test",
          title: "FAQ ทดสอบ",
          excerpt: "ช่วยค้นเคสติดตั้งและตอบ FAQ จากข้อมูลเผยแพร่",
          kind: "faq",
          href: "/faq",
        },
      ],
      AbortSignal.timeout(20000),
    );
    return { ok: true, text: result.text };
  } catch {
    return {
      ok: false,
      text: "เชื่อมต่อไม่ได้ ตรวจ GEMINI_API_KEY, Free Tier confirmation, รุ่นโมเดล และโควตาใน AI Studio",
    };
  }
}
export async function uploadAssistantAvatar(form: FormData) {
  const { profile } = await getCurrentAdminUser();
  if (profile.role !== "admin") throw new Error("Admin only");
  const state = String(form.get("state"));
  if (!avatarStates.includes(state as (typeof avatarStates)[number]))
    throw new Error("Invalid state");
  const file = form.get("file");
  if (
    !(file instanceof File) ||
    file.size > (state === "welcome" ? 256000 : 819200)
  )
    throw new Error("ไฟล์ใหญ่เกินกำหนด");
  const b = Buffer.from(await file.arrayBuffer()),
    png = b
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    webp =
      b.toString("ascii", 0, 4) === "RIFF" &&
      b.toString("ascii", 8, 12) === "WEBP";
  if (
    !(png && file.type === "image/png") &&
    !(webp && file.type === "image/webp")
  )
    throw new Error("รองรับ PNG/WebP เท่านั้น");
  const name = `${crypto.randomUUID()}.${png ? "png" : "webp"}`;
  const { error } = await createSupabaseAdminClient()
    .storage.from("assistant-avatars")
    .upload(name, b, {
      contentType: png ? "image/png" : "image/webp",
      upsert: false,
    });
  if (error) throw new Error("Upload failed");
  return `/api/assistant/avatars/${name}`;
}
