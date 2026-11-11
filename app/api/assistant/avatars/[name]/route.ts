import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!/^[a-f0-9-]{36}\.(png|webp)$/.test(name))
    return new Response(null, { status: 404 });
  const { data, error } = await createSupabaseAdminClient()
    .storage.from("assistant-avatars")
    .download(name);
  if (error || !data) return new Response(null, { status: 404 });
  return new Response(data, {
    headers: {
      "Content-Type": name.endsWith(".png") ? "image/png" : "image/webp",
      "Cache-Control": "public,max-age=86400,immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
