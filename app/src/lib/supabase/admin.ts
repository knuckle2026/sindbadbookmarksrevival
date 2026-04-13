import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Get an authenticated Supabase client for admin pages.
 * Verifies admin role and returns the client for subsequent queries.
 * Must be called once per page — reuse the returned client.
 */
export async function getAdminClient() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  console.log("[getAdminClient] authError:", authError?.message ?? "none");
  console.log("[getAdminClient] user:", user?.id ?? "null");
  console.log("[getAdminClient] role:", user?.app_metadata?.role ?? "none");

  if (!user) {
    redirect("/sbbm-control/login");
  }

  const role = user.app_metadata?.role;
  if (role !== "admin") {
    notFound();
  }

  // Quick test query to verify client works
  const { data: testGenres, error: testError } = await supabase
    .from("genres")
    .select("id")
    .limit(1);
  console.log("[getAdminClient] test query result:", testGenres?.length ?? 0, "error:", testError?.message ?? "none");

  return { supabase, user };
}
