import { z } from "zod";

export const avatarStates = [
  "welcome",
  "listening",
  "thinking",
  "answering",
  "error",
] as const;
export const models = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-3.8-flash",
] as const;
export const avatarFramingDefaults = { zoom: 100, x: 0, y: 0 };
export const avatarFramingLimits = {
  zoom: { min: 100, max: 160 },
  x: { min: -25, max: 25 },
  y: { min: -20, max: 20 },
} as const;
export const settingsSchema = z.object({
  enabled: z.boolean().default(false),
  publicEnabled: z.boolean().default(true),
  provider: z.enum(["gemini"]).default("gemini"),
  model: z.enum(models).default("gemini-2.5-flash-lite"),
  name: z.string().trim().min(1).max(60).default("ผู้ช่วย AI นายช่าง"),
  welcome: z
    .string()
    .min(1)
    .max(500)
    .default(
      "สวัสดีครับ ผมผู้ช่วย AI นายช่าง 👷 ช่วยตอบ FAQ และค้นหาเคสติดตั้งพร้อมเอกสารอ้างอิงได้ครับ ต้องการให้ช่วยเรื่องไหน?",
    ),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#2563eb"),
  quickActions: z
    .array(z.string().min(1).max(100))
    .max(6)
    .default(["ค้นหาแบบงานติดตั้ง", "คำถามที่พบบ่อย", "ติดต่อฝ่ายขาย"]),
  avatars: z
    .record(
      z.enum(avatarStates),
      z
        .string()
        .regex(/^\/api\/assistant\/avatars\/[a-f0-9-]+\.(png|webp)$/)
        .or(z.literal("")),
    )
    .default({
      welcome: "",
      listening: "",
      thinking: "",
      answering: "",
      error: "",
    }),
  avatarFraming: z
    .object({
      zoom: z
        .number()
        .int()
        .min(avatarFramingLimits.zoom.min)
        .max(avatarFramingLimits.zoom.max),
      x: z
        .number()
        .int()
        .min(avatarFramingLimits.x.min)
        .max(avatarFramingLimits.x.max),
      y: z
        .number()
        .int()
        .min(avatarFramingLimits.y.min)
        .max(avatarFramingLimits.y.max),
    })
    .default(avatarFramingDefaults),
  publicDailyLimit: z.number().int().min(1).max(15).default(15),
  staffDailyLimit: z.number().int().min(1).max(100).default(100),
  publicRetentionDays: z.number().int().min(1).max(7).default(7),
  staffRetentionDays: z.number().int().min(1).max(30).default(30),
  faqs: z.boolean().default(true),
  cases: z.boolean().default(true),
  documents: z.boolean().default(true),
  captcha: z.boolean().default(true),
  leadEnabled: z.boolean().default(false),
  companyContact: z.string().max(300).default(""),
  privacyUrl: z.string().url().max(500).or(z.literal("")).default(""),
  consentText: z
    .string()
    .max(500)
    .default("ยินยอมให้ Tigersoft ติดต่อกลับเกี่ยวกับคำขอนี้"),
  guidance: z
    .string()
    .max(2000)
    .default("ตอบภาษาไทยเป็นหลัก ตอบภาษาอังกฤษเมื่อผู้ใช้ถามภาษาอังกฤษ"),
});
export type AssistantSettings = z.infer<typeof settingsSchema>;
export const defaultSettings = settingsSchema.parse({});
export type AssistantSource = {
  id: string;
  title: string;
  href: string;
  excerpt: string;
  kind: "faq" | "case" | "document";
};
export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: AssistantSource[];
  fallback?: boolean;
};
export function safeAnswer(text: string) {
  // Only server-built source cards are clickable. Never render model HTML/Markdown.
  return text
    .replace(/https?:\/\/\S+/gi, "[ดูแหล่งอ้างอิงด้านล่าง]")
    .slice(0, 6000);
}
export function publicQuestion(text: string) {
  return !/(?:[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?66|0)[\d\s-]{8,12}|\b\d{13}\b)/i.test(
    text,
  );
}
export function unsafeQuestion(text: string) {
  return /(?:bypass|ขโมย|แฮก|หลบเลี่ยง|ปลดล็อก.*ไม่ได้รับอนุญาต|ปิด.*สัญญาณเตือน)/i.test(
    text,
  );
}
