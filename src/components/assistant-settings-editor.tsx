"use client";
import { useState } from "react";
import { AssistantAvatarHeader } from "@/src/components/assistant-avatar-header";
import {
  avatarFramingDefaults,
  avatarFramingLimits,
  avatarStates,
  models,
  type AssistantSettings,
} from "@/src/lib/assistant/config";
import {
  saveAssistantSettings,
  testAssistant,
  uploadAssistantAvatar,
} from "@/src/lib/actions/assistant";
export function AssistantSettingsEditor({
  initial,
  canEdit,
}: {
  initial: AssistantSettings;
  canEdit: boolean;
}) {
  const [s, set] = useState(initial),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [previewState, setPreviewState] =
      useState<(typeof avatarStates)[number]>("welcome");
  const update = (key: keyof AssistantSettings, value: unknown) =>
    set((prev) => ({ ...prev, [key]: value }));
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <form
        action={saveAssistantSettings}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6"
      >
        <input type="hidden" name="config" value={JSON.stringify(s)} />
        <fieldset
          disabled={!canEdit || busy}
          className="space-y-4 disabled:opacity-60"
        >
          {(
            [
              "enabled",
              "publicEnabled",
              "faqs",
              "cases",
              "documents",
              "captcha",
              "leadEnabled",
            ] as const
          ).map((key, i) => (
            <label
              key={key}
              className="mr-5 inline-flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={s[key]}
                onChange={(e) => update(key, e.target.checked)}
              />
              {
                [
                  "เปิด Widget",
                  "เปิด Public",
                  "ค้น FAQ",
                  "ค้นเคส",
                  "ค้นเอกสาร",
                  "Turnstile เมื่อเสี่ยง",
                  "เปิด Lead",
                ][i]
              }
            </label>
          ))}
          <label className="block text-sm font-semibold">
            ชื่อผู้ช่วย
            <input
              className="mt-1 block w-full rounded-lg border p-2"
              value={s.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold">
            ข้อความต้อนรับ
            <textarea
              className="mt-1 block w-full rounded-lg border p-2"
              rows={3}
              value={s.welcome}
              onChange={(e) => update("welcome", e.target.value)}
            />
          </label>
          <div className="flex gap-4">
            <label>
              ผู้ให้บริการ
              <select
                className="ml-2 rounded border p-2"
                value={s.provider}
                disabled
              >
                <option>gemini</option>
              </select>
            </label>
            <label>
              โมเดล
              <select
                className="ml-2 rounded border p-2"
                value={s.model}
                onChange={(e) => update("model", e.target.value)}
              >
                {models.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="text-xs text-slate-500">
            เลือกเฉพาะโมเดลที่หน้า AI Studio ของคุณแสดง Free Tier;
            ค่ายอื่นเพิ่มผ่าน Adapter ที่ผ่านการทดสอบก่อน
          </p>
          <label className="block">
            สีปุ่ม{" "}
            <input
              type="color"
              value={s.color}
              onChange={(e) => update("color", e.target.value)}
            />
          </label>
          <label className="block text-sm">
            Quick Actions (บรรทัดละรายการ)
            <textarea
              className="mt-1 block w-full rounded border p-2"
              value={s.quickActions.join("\n")}
              onChange={(e) =>
                update("quickActions", e.target.value.split("\n").slice(0, 6))
              }
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                "publicDailyLimit",
                "staffDailyLimit",
                "publicRetentionDays",
                "staffRetentionDays",
              ] as const
            ).map((key, i) => (
              <label key={key} className="text-sm">
                {
                  [
                    "Public / วัน (สูงสุด 15)",
                    "Staff / วัน (สูงสุด 100)",
                    "เก็บ Public (ไม่เกิน 7 วัน)",
                    "เก็บ Staff (ไม่เกิน 30 วัน)",
                  ][i]
                }
                <input
                  type="number"
                  min={1}
                  className="block w-full rounded border p-2"
                  value={s[key]}
                  onChange={(e) => update(key, Number(e.target.value))}
                />
              </label>
            ))}
          </div>
          {(
            ["companyContact", "privacyUrl", "consentText", "guidance"] as const
          ).map((key, i) => (
            <label key={key} className="block text-sm">
              {
                [
                  "ช่องทางติดต่อบริษัท",
                  "Privacy Policy URL",
                  "ข้อความยินยอม Lead",
                  "แนวทางตอบเพิ่มเติม (อยู่ภายใต้กฎความปลอดภัย)",
                ][i]
              }
              <textarea
                className="mt-1 block w-full rounded border p-2"
                value={s[key]}
                onChange={(e) => update(key, e.target.value)}
              />
            </label>
          ))}
          <p className="text-sm font-bold">
            Avatar PNG/WebP: Welcome ≤250 KB; สถานะอื่น ≤800 KB
          </p>
          {avatarStates.map((state) => (
            <label key={state} className="block text-sm">
              {state}
              <input
                type="file"
                accept="image/png,image/webp"
                className="ml-2 max-w-full"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setBusy(true);
                  try {
                    const f = new FormData();
                    f.set("file", file);
                    f.set("state", state);
                    const url = await uploadAssistantAvatar(f);
                    set((prev) => ({
                      ...prev,
                      avatars: { ...prev.avatars, [state]: url },
                    }));
                    setNotice("อัปโหลดแล้ว กดบันทึกเพื่อเก็บเวอร์ชัน");
                  } catch (err) {
                    setNotice(
                      err instanceof Error ? err.message : "Upload failed",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </label>
          ))}
          <div className="space-y-3 rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">จัดกรอบ Avatar</p>
              <button
                type="button"
                className="text-sm text-blue-700 underline"
                onClick={() => update("avatarFraming", avatarFramingDefaults)}
              >
                คืนค่าเริ่มต้น
              </button>
            </div>
            {(
              [
                ["zoom", "ขนาดภาพ"],
                ["x", "ตำแหน่งซ้าย / ขวา"],
                ["y", "ตำแหน่งขึ้น / ลง"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-sm">
                {label} · {s.avatarFraming[key]}%
                <input
                  type="range"
                  aria-label={label}
                  {...avatarFramingLimits[key]}
                  value={s.avatarFraming[key]}
                  className="block w-full accent-blue-700"
                  onChange={(e) => {
                    const value = e.currentTarget.valueAsNumber;
                    set((prev) => ({
                      ...prev,
                      avatarFraming: { ...prev.avatarFraming, [key]: value },
                    }));
                  }}
                />
              </label>
            ))}
            <p className="text-xs text-slate-500">
              ใช้กรอบเดียวกันทุกสถานะ ปรับด้วย Preview ก่อนบันทึก Draft หรือ
              Publish
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-lg border px-4 py-2" type="submit">
              บันทึก Draft
            </button>
            <button
              className="rounded-lg bg-blue-700 px-4 py-2 text-white"
              name="publish"
              value="yes"
            >
              บันทึกและ Publish
            </button>
          </div>
        </fieldset>
        <button
          type="button"
          disabled={busy}
          className="rounded-lg border px-4 py-2"
          onClick={async () => {
            setBusy(true);
            try {
              const r = await testAssistant(s);
              setNotice(r.text);
            } catch {
              setNotice("ทดสอบไม่สำเร็จ");
            } finally {
              setBusy(false);
            }
          }}
        >
          ทดสอบการเชื่อมต่อด้วย FAQ จำลอง
        </button>
        <p role="status" className="whitespace-pre-wrap text-sm text-blue-800">
          {notice}
        </p>
      </form>
      <aside className="h-fit w-full max-w-[420px] overflow-hidden rounded-2xl border bg-white shadow-sm">
        <label className="flex items-center justify-between gap-2 p-3 text-sm font-semibold">
          Preview Avatar
          <select
            value={previewState}
            className="rounded-md border p-1.5"
            onChange={(e) =>
              setPreviewState(e.currentTarget.value as typeof previewState)
            }
          >
            {avatarStates.map((state) => (
              <option key={state}>{state}</option>
            ))}
          </select>
        </label>
        <AssistantAvatarHeader
          settings={s}
          avatar={s.avatars[previewState] || s.avatars.welcome}
          status={
            previewState === "thinking"
              ? "ข้อมูลเผยแพร่ · กำลังคิดคำตอบ…"
              : "ข้อมูลเผยแพร่ · ผู้ช่วย AI"
          }
        />
        <p className="p-4 text-sm leading-7">{s.welcome}</p>
        <div className="flex flex-wrap gap-2 p-4">
          {s.quickActions.map((q) => (
            <span className="rounded-full bg-blue-50 px-3 py-2 text-xs" key={q}>
              {q}
            </span>
          ))}
        </div>
        <p className="p-4 text-xs text-slate-500">
          V1 ข้อมูล Public เท่านั้น • ปิดรูป/เสียงและข้อมูลภายใน •
          ไม่สลับค่ายอัตโนมัติ
        </p>
      </aside>
    </div>
  );
}
