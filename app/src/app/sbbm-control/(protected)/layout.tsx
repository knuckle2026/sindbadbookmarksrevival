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

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Non-admin → 404 (hide existence)
  if (!profile || profile.role !== "admin") {
    notFound();
  }

  return <>{children}</>;
}
