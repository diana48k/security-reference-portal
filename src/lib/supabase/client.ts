import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicConfigOrThrow } from "@/src/lib/supabase/config";

export function createClient() {
  const { url, key } = getSupabasePublicConfigOrThrow();

  return createBrowserClient(url, key);
}
