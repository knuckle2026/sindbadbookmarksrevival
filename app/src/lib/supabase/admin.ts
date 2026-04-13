import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Get an authenticated Supabase client for admin pages.
 * Verifies admin role and returns the client for subsequent queries.
 * Must be called once per page — reuse the returned client.
 */
export async function getAdminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sbbm-control/login");
  }

  const role = user.app_metadata?.role;
  if (role !== "admin") {
    notFound();
  }

  return { supabase, user };
}
