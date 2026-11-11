import Link from "next/link";
import { getCurrentAdminUser } from "@/src/lib/queries/admin";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { defaultSettings, settingsSchema } from "@/src/lib/assistant/config";
import { AssistantSettingsEditor } from "@/src/components/assistant-settings-editor";
import { publishAssistantVersion } from "@/src/lib/actions/assistant";
export const metadata = { title: "ตั้งค่าผู้ช่วย AI" };
export default async function AssistantSettingsPage() {
  const { profile } = await getCurrentAdminUser();
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("assistant_settings")
    .select("id,config,published,actor_id,created_at")
    .order("created_at", { ascending: false })
    .limit(20);
  const parsed = settingsSchema.safeParse(data?.[0]?.config ?? defaultSettings);
  const { data: turns } = await db.from('assistant_messages').select('status,input_tokens,output_tokens,latency_ms').order('created_at',{ascending:false}).limit(500);
  const stats = (turns ?? []).reduce((a,t) => ({total:a.total+1,ai:a.ai+(t.status==='done'?1:0),fallback:a.fallback+(t.status==='fallback'?1:0),tokens:a.tokens+(t.input_tokens??0)+(t.output_tokens??0),latency:a.latency+(t.latency_ms??0)}),{total:0,ai:0,fallback:0,tokens:0,latency:0});
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <h1 className="text-2xl font-bold">ตั้งค่าผู้ช่วย AI นายช่าง</h1>
        <Link
          href="/admin/assistant/inbox"
          className="rounded-xl bg-blue-700 px-4 py-2 text-white"
        >
          Lead / Feedback Inbox
        </Link>
      </div>
      {error ? (
        <p className="rounded-xl bg-amber-50 p-4 text-amber-900">
          ยังไม่พบตาราง Assistant กรุณารัน migration ก่อนบันทึก
        </p>
      ) : null}
      <p className="rounded-xl bg-slate-100 p-4 text-sm">
        Gemini key:{" "}
        {process.env.GEMINI_API_KEY ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า"} · Free
        Tier:{" "}
        {process.env.GEMINI_FREE_TIER_CONFIRMED === "true"
          ? "ยืนยันแล้ว"
          : "ยังไม่ยืนยัน"}{" "}
        · Cookie secret:{" "}
        {process.env.ASSISTANT_COOKIE_SECRET || process.env.ANALYTICS_HASH_SECRET ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า"}{" "}
        · Turnstile:{" "}
        {process.env.TURNSTILE_SECRET_KEY ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า"}
        <br />
        โหมดฟรีเท่านั้น ค่าโมเดล $0 ภายใต้ Free Tier ของ Google; Hosting/Storage
        แยกต่างหาก
      </p>
      <section className="grid gap-3 sm:grid-cols-4" aria-label="สถิติ 500 คำถามล่าสุด">{[['คำถามล่าสุด',stats.total],['AI / Fallback',`${stats.ai} / ${stats.fallback}`],['Token ที่รายงาน',stats.tokens],['เฉลี่ย (ms)',Math.round(stats.latency/Math.max(1,stats.total))]].map(([label,value])=><div key={label} className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">{label}</p><strong className="text-xl">{value}</strong></div>)}</section>
      <AssistantSettingsEditor
        initial={parsed.success ? parsed.data : defaultSettings}
        canEdit={profile.role === "admin"}
      />
      <section className="rounded-2xl border bg-white p-5">
        <h2 className="font-bold">ประวัติเวอร์ชัน / Rollback</h2>
        {data?.map((v) => (
          <form
            key={v.id}
            action={publishAssistantVersion}
            className="flex flex-wrap items-center gap-3 border-b py-3 text-sm"
          >
            <input type="hidden" name="id" value={v.id} />
            <span>
              {new Date(v.created_at).toLocaleString("th-TH", {
                timeZone: "Asia/Bangkok",
              })}{" "}
              · {v.actor_id} {v.published ? "· Published" : ""}
            </span>
            {profile.role === "admin" && !v.published ? (
              <button className="rounded border px-3 py-1">
                Publish เวอร์ชันนี้
              </button>
            ) : null}
          </form>
        ))}
      </section>
    </div>
  );
}
