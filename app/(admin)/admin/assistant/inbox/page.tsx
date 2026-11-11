import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { getCurrentAdminUser } from "@/src/lib/queries/admin";
import { updateAssistantFeedback, deleteAssistantFeedback } from "@/src/lib/actions/assistant";
import { ConfirmActionButton } from "@/src/components/confirm-action-button";
export default async function AssistantInbox() {
  const { profile } = await getCurrentAdminUser();
  const db = createSupabaseAdminClient();
  const [{ data, error }, { data: staff }] = await Promise.all([
    db
      .from("assistant_feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    db
      .from("profiles")
      .select("id,full_name")
      .eq("is_active", true)
      .in("role", ["admin", "tech"]),
  ]);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">นายช่าง · Lead / Feedback Inbox</h1>
      <p className="text-sm text-slate-500">
        100 รายการล่าสุด · ข้อมูลส่วนบุคคลลบหลังปิดงาน 90 วัน
      </p>
      {error ? <p>กรุณารัน migration ก่อนใช้งาน</p> : null}
      {!data?.length ? <p>ยังไม่มีรายการ</p> : null}
      {data?.map((item) => (
        <article
          key={item.id}
          className="space-y-3 rounded-2xl border bg-white p-5"
        >
          <div className="font-bold">
            {item.category} ·{" "}
            {new Date(item.created_at).toLocaleString("th-TH", {
              timeZone: "Asia/Bangkok",
            })}
          </div>
          <p className="whitespace-pre-wrap">{item.details}</p>
          {item.contact ? (
            <pre className="whitespace-pre-wrap rounded bg-slate-50 p-3 text-sm">
              {JSON.stringify(item.contact, null, 2)}
            </pre>
          ) : null}
          {item.transcript ? (
            <details>
              <summary>บทสนทนาที่ผู้ใช้ยืนยันแนบ</summary>
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(item.transcript, null, 2)}
              </pre>
            </details>
          ) : null}
          <form
            action={updateAssistantFeedback}
            className="flex flex-wrap gap-3"
          >
            <input type="hidden" name="id" value={item.id} />
            <select
              name="status"
              defaultValue={item.status}
              className="rounded border p-2"
            >
              {["new", "in_progress", "resolved", "rejected"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              name="assignee"
              defaultValue={item.assignee_id ?? ""}
              className="rounded border p-2"
            >
              <option value="">ยังไม่มอบหมาย</option>
              {staff?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name ?? s.id}
                </option>
              ))}
            </select>
            <input
              name="note"
              defaultValue={item.resolution_note ?? ""}
              placeholder="บันทึกการดำเนินงาน"
              maxLength={2000}
              className="min-w-48 flex-1 rounded border p-2"
            />
            <button className="rounded bg-blue-700 px-4 py-2 text-white">
              บันทึก
            </button>
          </form>
          {profile.role === 'admin' ? <form action={deleteAssistantFeedback}><input type="hidden" name="id" value={item.id}/><ConfirmActionButton confirmMessage="ลบ Lead / Feedback นี้ถาวรพร้อมข้อมูลติดต่อและบทสนทนาที่แนบ?">ลบข้อมูลรายการนี้</ConfirmActionButton></form> : null}
        </article>
      ))}
    </div>
  );
}
