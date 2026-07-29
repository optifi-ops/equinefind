import { createClient } from "./supabase/client";

export const supabase = createClient();

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getToken(): Promise<string | null> {
  const session = await getSession();
  return session?.access_token ?? null;
}
