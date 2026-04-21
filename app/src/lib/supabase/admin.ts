// @ts-nocheck
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    notFound();
  }

  return { supabase, user };
}
