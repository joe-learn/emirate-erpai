"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/** نسخة مفردة (singleton) للاستخدام داخل مكوّنات العميل */
let browserClient: ReturnType<typeof createClient> | null = null;
export function supabaseBrowser() {
  if (!browserClient) browserClient = createClient();
  return browserClient;
}
