import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicConfigOrThrow } from "@/src/lib/supabase/config";
import type { Database } from "@/src/types/database";

export function createClient(): SupabaseClient<Database> {
  const { url, key } = getSupabasePublicConfigOrThrow();

  return createBrowserClient<Database>(url, key);
}
