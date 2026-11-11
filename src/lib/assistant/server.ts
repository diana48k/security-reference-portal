import "server-only";
import { createHmac, randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import {
  defaultSettings,
  settingsSchema,
  type AssistantSource,
} from "./config";

export async function loadSettings() {
  try {
    const { data, error } = await createSupabaseAdminClient()
      .from("assistant_settings")
      .select("config")
      .eq("published", true)
      .maybeSingle();
    if (error) return defaultSettings;
    return data ? settingsSchema.parse(data.config) : defaultSettings;
  } catch {
    return defaultSettings;
  }
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !!origin && origin === new URL(request.url).origin;
}
export function identity(request: NextRequest) {
  const secret =
    process.env.ASSISTANT_COOKIE_SECRET || process.env.ANALYTICS_HASH_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("Missing assistant cookie secret");
  const raw = request.cookies.get("assistant_visitor")?.value ?? "";
  const [id, signature] = raw.split(".");
  const sign = (value: string) =>
    createHmac("sha256", secret).update(`assistant:v1:${value}`).digest("hex");
  const valid = /^[a-f0-9-]{36}$/.test(id ?? "") && signature === sign(id);
  const visitor = valid ? id : randomUUID();
  return {
    owner: sign(visitor),
    cookie: `${visitor}.${sign(visitor)}`,
    network: sign(
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local",
    ),
  };
}
export async function staffUser() {
  const db = await createSupabaseServerClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  const { data } = await db
    .from("profiles")
    .select("id,role,is_active,must_change_password")
    .eq("id", user.id)
    .maybeSingle();
  return data?.is_active && !data.must_change_password ? data : null;
}
export async function takeQuota(key: string, limit: number, seconds: number) {
  const { data, error } = await createSupabaseAdminClient().rpc(
    "assistant_take_quota",
    { p_key: key, p_limit: limit, p_seconds: seconds },
  );
  if (error) throw new Error("Quota unavailable");
  return Number(data) <= limit;
}
export async function searchSources(
  query: string,
  settings: Awaited<ReturnType<typeof loadSettings>>,
) {
  const { data, error } = await createSupabaseAdminClient().rpc(
    "assistant_search",
    { p_query: query },
  );
  if (error) throw new Error("Search unavailable");
  return (data as AssistantSource[]).filter(
    (s) =>
      settings[
        s.kind === "faq" ? "faqs" : s.kind === "case" ? "cases" : "documents"
      ],
  );
}
export async function jsonBody(request: Request, max = 10000) {
  const text = await request.text();
  if (Buffer.byteLength(text) > max) throw new Error("Request too large");
  return JSON.parse(text);
}
