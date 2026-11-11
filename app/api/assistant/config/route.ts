import { NextRequest, NextResponse } from "next/server";
import { identity, loadSettings } from "@/src/lib/assistant/server";
export async function GET(req: NextRequest) {
  const s = await loadSettings();
  const { guidance: _guidance, ...publicConfig } = s;
  void _guidance;
  const response = NextResponse.json(publicConfig, {
    headers: { "Cache-Control": "no-store" },
  });
  if (s.enabled) {
    try {
      const who = identity(req);
      response.cookies.set("assistant_visitor", who.cookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 604800,
      });
    } catch {
      /* Disabled until signing secret is configured. */
    }
  }
  return response;
}
