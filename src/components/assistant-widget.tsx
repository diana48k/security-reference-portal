"use client";
import Link from "next/link";
import { AssistantAvatarHeader } from "@/src/components/assistant-avatar-header";
import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Send,
  X,
  RotateCcw,
  Search,
  MessageSquarePlus,
} from "lucide-react";
import {
  type AssistantSettings,
  type ChatMessage,
} from "@/src/lib/assistant/config";

export default function AssistantWidget({ userId }: { userId?: string }) {
  const [config, setConfig] = useState<AssistantSettings | null>(null),
    [open, setOpen] = useState(false),
    [greeting, setGreeting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]),
    [text, setText] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [conversation, setConversation] = useState<string>(),
    [feedback, setFeedback] = useState(false),
    [lead, setLead] = useState(false);
  const [challenge, setChallenge] = useState<string>(),
    [captchaToken, setCaptchaToken] = useState<string>();
  const dialog = useRef<HTMLDivElement>(null),
    overlay = useRef<HTMLDivElement>(null),
    launcher = useRef<HTMLButtonElement>(null),
    input = useRef<HTMLTextAreaElement>(null),
    end = useRef<HTMLDivElement>(null),
    abort = useRef<AbortController | null>(null);
  const storageKey = `assistant:v1:${userId ?? "public"}`;
  useEffect(() => {
    let active = true;
    void fetch("/api/assistant/config")
      .then((r) => r.json())
      .then((s) => {
        if (active) setConfig(s);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!config?.enabled) return;
    const timer = setTimeout(() => {
      if (!localStorage.getItem("assistant:greeting-dismissed"))
        setGreeting(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [config?.enabled]);
  useEffect(() => {
    let active = true;
    const id = localStorage.getItem(storageKey);
    if (id)
      void fetch(`/api/assistant/conversations/${id}`)
        .then(async (r) => {
          if (!r.ok) {
            localStorage.removeItem(storageKey);
            return;
          }
          const data = await r.json();
          if (active) {
            setConversation(id);
            setMessages(data.messages);
          }
        })
        .catch(() => {});
    return () => {
      active = false;
    };
  }, [storageKey]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const viewport = window.visualViewport;
    const panel = overlay.current;
    const resize = () => {
      if (!panel || !viewport) return;
      panel.style.setProperty(
        "--assistant-visible-height",
        `${viewport.height}px`,
      );
      panel.style.setProperty(
        "--assistant-visible-top",
        `${viewport.offsetTop}px`,
      );
    };
    resize();
    viewport?.addEventListener("resize", resize);
    viewport?.addEventListener("scroll", resize);
    if (window.matchMedia("(min-width: 640px) and (pointer: fine)").matches) {
      input.current?.focus({ preventScroll: true });
    } else {
      dialog.current?.focus({ preventScroll: true });
    }
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab") {
        const nodes = dialog.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),a[href],textarea,input,select",
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === dialog.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handle);
    return () => {
      document.removeEventListener("keydown", handle);
      viewport?.removeEventListener("resize", resize);
      viewport?.removeEventListener("scroll", resize);
      if (previous instanceof HTMLElement)
        previous.focus({ preventScroll: true });
    };
  }, [open]);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "instant" });
  }, [messages, busy, feedback]);
  if (!config?.enabled || (!userId && !config.publicEnabled)) return null;
  const s = config;
  const state = error
    ? "error"
    : busy
      ? "thinking"
      : messages.length
        ? "answering"
        : text
          ? "listening"
          : "welcome";
  const avatar = s.avatars[state] || s.avatars.welcome;
  function dismiss() {
    setGreeting(false);
    localStorage.setItem("assistant:greeting-dismissed", "1");
  }
  async function send(searchOnly = false, value = text) {
    if (busy || !value.trim()) return;
    setError("");
    setBusy(true);
    setText("");
    setFeedback(false);
    const id = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: `${id}:user`, role: "user", text: value },
    ]);
    abort.current = new AbortController();
    try {
      const r = await fetch("/api/assistant/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation,
          clientMessageId: id,
          text: value,
          searchOnly,
          captchaToken,
        }),
        signal: abort.current.signal,
      });
      setCaptchaToken(undefined);
      if (r.headers.get("content-type")?.includes("text/event-stream")) {
        const reader = r.body?.getReader();
        if (!reader) throw new Error("ไม่พบคำตอบ");
        const decoder = new TextDecoder();
        let buffer = "",
          completed = false;
        for (;;) {
          const chunk = await reader.read();
          buffer += decoder.decode(chunk.value, { stream: !chunk.done });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";
          for (const event of events) {
            const kind = event
              .split("\n")
              .find((l) => l.startsWith("event: "))
              ?.slice(7);
            const payload = event
              .split("\n")
              .find((l) => l.startsWith("data: "))
              ?.slice(6);
            if (!payload) continue;
            const data = JSON.parse(payload);
            if (kind === "session") {
              setConversation(data.conversationId);
              localStorage.setItem(storageKey, data.conversationId);
            }
            if (kind === "delta")
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                return last?.id === id
                  ? [
                      ...prev.slice(0, -1),
                      { ...last, text: last.text + data.text },
                    ]
                  : [...prev, { id, role: "assistant", text: data.text }];
              });
            if (kind === "done") {
              completed = true;
              setMessages((prev) => [
                ...prev.filter((m) => m.id !== id),
                data.message,
              ]);
            }
            if (kind === "error") throw new Error(data.error);
          }
          if (chunk.done) break;
        }
        if (!completed)
          throw new Error("การเชื่อมต่อขาด เปิดบทสนทนาอีกครั้งเพื่อตรวจคำตอบ");
      } else {
        const data = await r.json();
        if (data.challenge && data.siteKey) setChallenge(data.siteKey);
        if (!r.ok) throw new Error(data.error ?? "ไม่สามารถตอบได้");
        setConversation(data.conversationId);
        localStorage.setItem(storageKey, data.conversationId);
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (err) {
      setError(
        err instanceof Error && err.name === "AbortError"
          ? "หยุดรอคำตอบแล้ว เปิดบทสนทนาใหม่อีกครั้งเพื่อตรวจคำตอบที่บันทึกไว้"
          : err instanceof Error
            ? err.message
            : "ระบบไม่พร้อม",
      );
      setText(value);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      {greeting && !open ? (
        <div className="fixed bottom-24 right-5 z-40 max-w-64 rounded-2xl border border-blue-100 bg-white p-4 pr-8 text-sm shadow-xl">
          <button
            aria-label="ปิดคำทักทาย"
            onClick={dismiss}
            className="absolute right-2 top-2"
          >
            <X size={14} />
          </button>
          สวัสดีครับ มีอะไรให้นายช่างช่วยไหม?
        </div>
      ) : null}
      <button
        ref={launcher}
        aria-label="เปิดผู้ช่วย AI นายช่าง"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          dismiss();
        }}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition hover:scale-105 print:hidden"
        style={{ background: s.color }}
      >
        <MessageCircle size={26} />
      </button>
      {open ? (
        <div
          ref={overlay}
          className="fixed inset-x-0 top-[var(--assistant-visible-top,0px)] z-[70] h-[var(--assistant-visible-height,100dvh)] bg-slate-950/20 sm:pointer-events-none sm:inset-0 sm:h-auto sm:bg-transparent print:hidden"
        >
          <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-label={s.name}
            tabIndex={-1}
            className="pointer-events-auto absolute inset-0 flex flex-col overflow-hidden bg-white shadow-2xl sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[680px] sm:max-h-[calc(100dvh-40px)] sm:w-[420px] sm:rounded-3xl sm:border"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <AssistantAvatarHeader
              settings={s}
              avatar={avatar}
              status={
                busy
                  ? "ข้อมูลเผยแพร่ · กำลังคิดคำตอบ…"
                  : "ข้อมูลเผยแพร่ · ผู้ช่วย AI"
              }
              className="h-[clamp(80px,calc(var(--assistant-visible-height,100dvh)-255px),180px)] sm:h-[clamp(104px,calc(100dvh-340px),240px)]"
              controls={
                <>
                  <button
                    type="button"
                    title="เริ่มบทสนทนาใหม่"
                    aria-label="เริ่มบทสนทนาใหม่"
                    className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-white/15 disabled:opacity-50"
                    disabled={busy}
                    onClick={() => {
                      setMessages([]);
                      setConversation(undefined);
                      localStorage.removeItem(storageKey);
                      setError("");
                    }}
                  >
                    <RotateCcw size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label="ปิดแชท"
                    className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-white/15"
                    onClick={() => setOpen(false)}
                  >
                    <X size={22} />
                  </button>
                </>
              }
            />
            <div
              className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4"
              aria-live="polite"
              aria-busy={busy}
            >
              <div className="rounded-2xl rounded-tl-sm bg-slate-100 p-3 text-sm leading-6">
                {s.welcome}
              </div>
              <p className="text-[11px] leading-5 text-slate-500">
                ข้อความอาจประมวลผลโดย Gemini Free Tier เพื่อปรับปรุงบริการ
                โปรดไม่ใส่ข้อมูลส่วนบุคคลหรือข้อมูลลับ · Public เก็บ 7 วัน /
                ทีมงาน 30 วัน
                {s.privacyUrl ? (
                  <a
                    href={s.privacyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 underline"
                  >
                    นโยบายข้อมูล
                  </a>
                ) : null}
              </p>
              <div className="flex flex-wrap gap-2">
                {s.quickActions.map((q) => (
                  <button
                    key={q}
                    disabled={busy}
                    onClick={() =>
                      q.includes("ติดต่อ")
                        ? (setLead(true), setFeedback(true))
                        : void send(false, q)
                    }
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800"
                  >
                    {q}
                  </button>
                ))}
              </div>
              {messages.map((m) => (
                <div key={m.id} className={m.role === "user" ? "ml-8" : "mr-3"}>
                  <p
                    className={`whitespace-pre-wrap rounded-2xl p-3 text-sm leading-6 ${m.role === "user" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-800"}`}
                  >
                    {m.text}
                  </p>
                  {m.fallback ? (
                    <p className="mt-1 text-xs text-amber-800">
                      โหมดค้นหาข้อมูล · AI ไม่พร้อมหรือไม่มีข้อมูลเพียงพอ
                    </p>
                  ) : null}
                  {m.sources?.map((source) => (
                    <Link
                      key={source.id}
                      href={source.href}
                      className="mt-2 block rounded-xl border border-blue-100 bg-white p-3 text-xs text-blue-800"
                    >
                      {source.kind} · {source.title} ↗
                    </Link>
                  ))}
                  {m.role === "assistant" ? (
                    <div className="mt-1 flex gap-3 text-xs text-slate-500">
                      <button
                        onClick={() => {
                          setLead(false);
                          setFeedback(true);
                        }}
                      >
                        👍 / 👎 ให้คะแนนคำตอบ
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
              {busy ? (
                <div role="status" className="text-sm text-blue-700">
                  กำลังค้นหา FAQ และเคสที่เกี่ยวข้อง…{" "}
                  <button
                    className="underline"
                    onClick={() => abort.current?.abort()}
                  >
                    หยุด
                  </button>
                </div>
              ) : null}
              {error ? (
                <div
                  role="alert"
                  className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900"
                >
                  {error}
                  <button
                    className="ml-2 underline"
                    onClick={() => void send(true)}
                  >
                    ค้นข้อมูลแทน
                  </button>
                  <Link href="/search" className="ml-2 underline">
                    หน้าค้นหา
                  </Link>
                </div>
              ) : null}
              {challenge ? (
                <Turnstile
                  siteKey={challenge}
                  onToken={(token) => {
                    setCaptchaToken(token);
                    setChallenge(undefined);
                    setError("ยืนยันแล้ว กดส่งอีกครั้งได้ครับ");
                  }}
                />
              ) : null}
              {feedback ? (
                <FeedbackForm
                  config={s}
                  lead={lead}
                  conversation={conversation}
                  onClose={() => setFeedback(false)}
                />
              ) : null}
              <div ref={end} />
            </div>
            <footer className="shrink-0 border-t bg-white p-3">
              <div className="mb-2 flex gap-3 text-xs text-slate-600">
                <button
                  onClick={() => {
                    setLead(false);
                    setFeedback(true);
                  }}
                  className="inline-flex items-center gap-1"
                >
                  <MessageSquarePlus size={13} />
                  ข้อเสนอแนะ
                </button>
                {s.leadEnabled ? (
                  <button
                    onClick={() => {
                      setLead(true);
                      setFeedback(true);
                    }}
                  >
                    ให้ฝ่ายขายติดต่อกลับ
                  </button>
                ) : null}
                <span className="ml-auto">รูป/เสียง: ยังไม่เปิด</span>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void send();
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  ref={input}
                  value={text}
                  maxLength={1000}
                  rows={2}
                  placeholder="ถามเรื่องระบบหรือแบบงานติดตั้ง…"
                  aria-label="ข้อความถึงนายช่าง"
                  className="min-w-0 flex-1 resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing
                    ) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                />
                <button
                  type="button"
                  title="ค้นข้อมูลโดยไม่ใช้ AI"
                  aria-label="ค้นข้อมูลโดยไม่ใช้ AI"
                  disabled={busy}
                  className="rounded-xl border p-3"
                  onClick={() => void send(true)}
                >
                  <Search size={18} />
                </button>
                <button
                  aria-label="ส่งข้อความ"
                  disabled={busy || !text.trim()}
                  className="rounded-xl p-3 text-white disabled:opacity-40"
                  style={{ background: s.color }}
                >
                  <Send size={18} />
                </button>
              </form>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}
type TurnstileApi = {
  render: (
    node: HTMLElement,
    options: { sitekey: string; callback: (token: string) => void },
  ) => string;
  remove: (id: string) => void;
};
function Turnstile({
  siteKey,
  onToken,
}: {
  siteKey: string;
  onToken: (token: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null),
    callback = useRef(onToken);
  useEffect(() => {
    callback.current = onToken;
  }, [onToken]);
  useEffect(() => {
    let cancelled = false,
      id: string | undefined;
    const w = window as unknown as { turnstile?: TurnstileApi };
    const mount = () => {
      if (!cancelled && ref.current && w.turnstile)
        id = w.turnstile.render(ref.current, {
          sitekey: siteKey,
          callback: (token) => callback.current(token),
        });
    };
    let script = document.querySelector<HTMLScriptElement>(
      "script[data-assistant-turnstile]",
    );
    if (w.turnstile) mount();
    else {
      if (!script) {
        script = document.createElement("script");
        script.dataset.assistantTurnstile = "true";
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", mount);
    }
    return () => {
      cancelled = true;
      script?.removeEventListener("load", mount);
      if (id) w.turnstile?.remove(id);
    };
  }, [siteKey]);
  return <div ref={ref} aria-label="ยืนยันการใช้งาน" />;
}
function FeedbackForm({
  config,
  lead,
  conversation,
  onClose,
}: {
  config: AssistantSettings;
  lead: boolean;
  conversation?: string;
  onClose: () => void;
}) {
  const [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  if (
    lead &&
    (!config.leadEnabled || !config.privacyUrl || !config.companyContact)
  )
    return (
      <div className="rounded-xl bg-slate-50 p-3 text-sm">
        ยังไม่เปิดแบบฟอร์มติดต่อฝ่ายขาย{" "}
        <button onClick={onClose} className="underline">
          ปิด
        </button>
      </div>
    );
  return (
    <form
      className="space-y-3 rounded-xl border bg-white p-3 text-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const f = new FormData(e.currentTarget);
        try {
          const r = await fetch("/api/assistant/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              category: lead ? "sales_lead" : f.get("category"),
              details: f.get("details"),
              consent: f.get("consent") === "on",
              attachTranscript: f.get("attach") === "on",
              conversationId: conversation,
              contact: lead
                ? {
                    name: f.get("name"),
                    company: f.get("company"),
                    channel: f.get("channel"),
                    province: f.get("province"),
                  }
                : undefined,
            }),
          });
          const result = await r.json();
          setStatus(r.ok ? "ส่งให้ทีมงานแล้วครับ" : result.error);
        } catch {
          setStatus("ส่งไม่สำเร็จ กรุณาลองใหม่");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="flex justify-between font-bold">
        <span>
          {lead ? "ให้ฝ่ายขายติดต่อกลับ" : "ให้คะแนน / ส่งข้อเสนอแนะ"}
        </span>
        <button type="button" onClick={onClose} aria-label="ปิดฟอร์ม">
          <X size={16} />
        </button>
      </div>
      {!lead ? (
        <select name="category" className="w-full rounded border p-2">
          <option value="rating">
            คะแนน: มีประโยชน์ / ควรปรับปรุง (ระบุด้านล่าง)
          </option>
          <option value="content_gap">ข้อมูลไม่ครบ / ไม่ตรงคำถาม</option>
          <option value="bug">ข้อมูลผิด / ลิงก์ผิด / ไม่ปลอดภัย</option>
          <option value="feature_request">ขอฟีเจอร์เพิ่ม</option>
          <option value="technical_review">ปรึกษาทีมเทคนิค</option>
        </select>
      ) : (
        <>
          {["name", "company", "channel", "province"].map((n, i) => (
            <input
              key={n}
              name={n}
              required={n === "name" || n === "channel"}
              maxLength={100}
              placeholder={
                ["ชื่อ", "บริษัท", "เบอร์โทรหรืออีเมล", "จังหวัด"][i]
              }
              className="block w-full rounded border p-2"
            />
          ))}
        </>
      )}
      <textarea
        name="details"
        required
        minLength={2}
        maxLength={2000}
        placeholder={
          lead
            ? "สนใจระบบใด / ต้องการให้ช่วยเรื่องใด"
            : "รายละเอียดและคะแนนคำตอบ"
        }
        className="w-full rounded border p-2"
      />
      <label className="flex gap-2 text-xs">
        <input type="checkbox" name="attach" />
        แนบข้อความล่าสุดให้ทีมงานตรวจสอบ (ไม่ส่งเข้า AI)
      </label>
      <label className="flex gap-2 text-xs">
        <input type="checkbox" name="consent" required />
        {lead ? config.consentText : "ยืนยันส่งข้อมูลนี้ให้ทีมงาน"}
      </label>
      {lead ? (
        <p className="text-xs">
          {config.companyContact} ·{" "}
          <a
            href={config.privacyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            นโยบายข้อมูล
          </a>
        </p>
      ) : null}
      <button
        disabled={busy}
        className="rounded-lg bg-blue-700 px-4 py-2 text-white"
      >
        {busy ? "กำลังส่ง…" : "ยืนยันส่ง"}
      </button>
      <p role="status">{status}</p>
    </form>
  );
}
