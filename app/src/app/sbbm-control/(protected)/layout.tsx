// @ts-nocheck
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in → redirect to login
  if (!user) {
    redirect("/sbbm-control/login");
  }

  // Check admin role from JWT app_metadata (no DB query needed)
  const role = user.app_metadata?.role;
  if (role !== "admin") {
    notFound();
  }

  return <>{children}</>;
}
