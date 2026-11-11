import { NextRequest } from "next/server";
import { identity, staffUser } from "@/src/lib/assistant/server";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params,
      who = identity(req),
      staff = await staffUser(),
      db = createSupabaseAdminClient();
    const owner = staff ? `user:${staff.id}` : who.owner;
    const { data: c } = await db
      .from("assistant_conversations")
      .select("id")
      .eq("id", id)
      .eq("owner_hash", owner)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (!c) return Response.json({ error: "Not found" }, { status: 404 });
    const { data, error } = await db
      .from("assistant_messages")
      .select("id,question,answer,sources,status")
      .eq("conversation_id", id)
      .eq("owner_hash", owner)
      .order("created_at")
      .limit(100);
    if (error) throw error;
    return Response.json(
      {
        messages: (data ?? []).flatMap((m) => [
          { id: `${m.id}:user`, role: "user", text: m.question },
          ...(m.answer
            ? [
                {
                  id: m.id,
                  role: "assistant",
                  text: m.answer,
                  sources: m.sources,
                  fallback: m.status === "fallback",
                },
              ]
            : []),
        ]),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "Unavailable" }, { status: 503 });
  }
}
