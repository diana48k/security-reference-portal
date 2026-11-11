// Explicit opt-in integration check against a running local server and linked DB.
// Uses only deterministic search, temporary settings, and deletes its own fixtures.
import assert from "node:assert/strict";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { defaultSettings } from "../src/lib/assistant/config.ts";
nextEnv.loadEnvConfig(process.cwd());
const base = "http://localhost:3100";
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);
const { data: current, error } = await db
  .from("assistant_settings")
  .select("id")
  .eq("published", true);
assert.ifError(error);
assert.equal(
  current.length,
  0,
  "Refusing to replace an existing published configuration",
);
const { data: fixture, error: seedError } = await db
  .from("assistant_settings")
  .insert({
    config: { ...defaultSettings, enabled: true, captcha: false },
    published: true,
  })
  .select("id")
  .single();
assert.ifError(seedError);
let conversationId;
try {
  const res = await fetch(`${base}/api/assistant/messages`, {
    method: "POST",
    headers: { origin: base, "content-type": "application/json" },
    body: JSON.stringify({
      clientMessageId: crypto.randomUUID(),
      text: "ประตู",
      searchOnly: true,
    }),
  });
  assert.equal(res.status, 200);
  const cookie = res.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie);
  const body = await res.text();
  const events = body
    .split("\n\n")
    .filter(Boolean)
    .map((x) => ({
      kind: x.split("\n")[0].slice(7),
      data: JSON.parse(x.split("\n")[1].slice(6)),
    }));
  const done = events.find((e) => e.kind === "done");
  assert.ok(done);
  conversationId = done.data.conversationId;
  assert.equal(done.data.message.fallback, true);
  assert.ok(done.data.message.sources.length > 0);
  assert.ok(done.data.message.sources.every((s) => s.href.startsWith("/")));
  const history = await fetch(
    `${base}/api/assistant/conversations/${conversationId}`,
    { headers: { cookie } },
  );
  assert.equal(history.status, 200);
  assert.equal((await history.json()).messages.length, 2);
  const stolen = await fetch(
    `${base}/api/assistant/conversations/${conversationId}`,
  );
  assert.equal(stolen.status, 404);
  const badOrigin = await fetch(`${base}/api/assistant/messages`, {
    method: "POST",
    headers: {
      origin: "https://evil.example",
      "content-type": "application/json",
    },
    body: "{}",
  });
  assert.equal(badOrigin.status, 403);
  console.log(
    "PASS: real database retrieval, SSE fallback, signed cookie history, owner isolation, origin guard",
  );
} finally {
  if (conversationId)
    await db.from("assistant_conversations").delete().eq("id", conversationId);
  await db.from("assistant_settings").delete().eq("id", fixture.id);
}
