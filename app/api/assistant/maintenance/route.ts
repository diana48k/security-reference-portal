import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
export async function GET(req: Request) {
  if (
    !process.env.CRON_SECRET ||
    req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  )
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const db = createSupabaseAdminClient(),
    now = new Date().toISOString();
  const results = await Promise.all([
    db.from("assistant_conversations").delete().lt("expires_at", now),
    db.from("assistant_rate_buckets").delete().lt("expires_at", now),
    db
      .from("assistant_messages")
      .update({
        status: "failed",
        answer: "การตอบครั้งก่อนหยุดลง กรุณาถามใหม่",
      })
      .eq("status", "pending")
      .lt("created_at", new Date(Date.now() - 120000).toISOString()),
    db
      .from("assistant_feedback")
      .delete()
      .lt("closed_at", new Date(Date.now() - 90 * 86400000).toISOString()),
  ]);
  return Response.json(
    { ok: results.every((r) => !r.error) },
    { status: results.some((r) => r.error) ? 500 : 200 },
  );
}
