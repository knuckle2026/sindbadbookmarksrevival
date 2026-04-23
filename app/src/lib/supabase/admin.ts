import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/queries/profiles";

/**
 * Get an authenticated Supabase client for admin pages.
 * Verifies admin role (read from D1) and returns the client plus the auth user.
 */
export async function getAdminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sbbm-control/login");
  }

  const profile = await getProfile(user.id);
  if (profile?.role !== "admin") {
    notFound();
  }

  return { supabase, user, profile };
}
