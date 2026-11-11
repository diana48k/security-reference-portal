import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultSettings,
  settingsSchema,
  safeAnswer,
  publicQuestion,
  unsafeQuestion,
} from "../src/lib/assistant/config.ts";
test("public settings fail closed and bound quotas/provider/model", () => {
  assert.equal(defaultSettings.enabled, false);
  assert.equal(
    settingsSchema.safeParse({ ...defaultSettings, provider: "arbitrary-url" })
      .success,
    false,
  );
  assert.equal(
    settingsSchema.safeParse({ ...defaultSettings, model: "paid-unlisted" })
      .success,
    false,
  );
  assert.equal(
    settingsSchema.safeParse({ ...defaultSettings, publicDailyLimit: 100000 })
      .success,
    false,
  );
  assert.equal(
    settingsSchema.safeParse({ ...defaultSettings, publicRetentionDays: 31 })
      .success,
    false,
  );
});
test("avatar references cannot escape server-controlled asset route", () => {
  assert.equal(
    settingsSchema.safeParse({
      ...defaultSettings,
      avatars: {
        ...defaultSettings.avatars,
        welcome: "https://tracker.example/avatar.svg",
      },
    }).success,
    false,
  );
  assert.equal(
    settingsSchema.safeParse({
      ...defaultSettings,
      avatars: {
        ...defaultSettings.avatars,
        welcome: "/api/assistant/avatars/1234-abcd.webp",
      },
    }).success,
    true,
  );
});
test("existing assistant settings load without avatar framing and new framing survives saving", () => {
  const oldConfig = { enabled: true, name: "นายช่าง" };
  const loaded = settingsSchema.parse(oldConfig);
  assert.equal(loaded.enabled, true);
  assert.deepEqual(loaded.avatarFraming, { zoom: 100, x: 0, y: 0 });
  const updated = { zoom: 135, x: -10, y: 12 };
  assert.deepEqual(
    settingsSchema.parse(
      JSON.parse(JSON.stringify({ ...loaded, avatarFraming: updated })),
    ).avatarFraming,
    updated,
  );
  assert.equal(
    settingsSchema.safeParse({ avatarFraming: { ...updated, zoom: 300 } })
      .success,
    false,
  );
});
test("personal contact is not sent to unpaid provider", () => {
  for (const text of [
    "โทร 0812345678",
    "ติดต่อ sale@example.com",
    "รหัส 1234567890123",
  ])
    assert.equal(publicQuestion(text), false);
  assert.equal(publicQuestion("ขอเคสติดตั้งประตูกระจก"), true);
});
test("guardrails block bypass requests and generated URLs are never clickable", () => {
  assert.equal(unsafeQuestion("วิธี bypass access control"), true);
  assert.equal(unsafeQuestion("ขอตัวอย่างติดตั้ง access control"), false);
  assert.ok(!safeAnswer("ดู https://evil.example/x").includes("https://"));
  assert.equal(safeAnswer("x".repeat(10000)).length, 6000);
});
