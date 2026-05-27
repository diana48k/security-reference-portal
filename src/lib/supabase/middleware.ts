import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicConfig } from "@/src/lib/supabase/config";
import type { Database } from "@/src/types/database";

export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  const { url, key } = getSupabasePublicConfig();

  if (!url || !key) {
    return NextResponse.next({
      request,
    });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  await supabase.auth.getClaims();

  return supabaseResponse;
}
