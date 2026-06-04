import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicConfig } from "@/src/lib/supabase/config";
import type { Database } from "@/src/types/database";

function pinAdminRequestsToVercelDeployment(
  request: NextRequest,
  response: NextResponse,
) {
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID;
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  if (!deploymentId || !isAdminRoute || request.cookies.get("__vdpl")) {
    return response;
  }

  response.cookies.set("__vdpl", deploymentId, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
  });

  return response;
}

export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  const { url, key } = getSupabasePublicConfig();

  if (!url || !key) {
    return pinAdminRequestsToVercelDeployment(
      request,
      NextResponse.next({
        request,
      }),
    );
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

  return pinAdminRequestsToVercelDeployment(request, supabaseResponse);
}
