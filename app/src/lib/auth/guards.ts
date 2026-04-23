import { notFound, redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getDB } from "@/lib/db/client";
import type { ProfileRow } from "@/lib/db/types";

export type CurrentUser = {
  authUser: User;
  profile: ProfileRow;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const db = await getDB();
  const profile = await db
    .prepare("SELECT * FROM profiles WHERE id = ?")
    .bind(user.id)
    .first<ProfileRow>();
  if (!profile) return null;

  return { authUser: user, profile };
}

export async function requireUser(loginPath = "/login"): Promise<CurrentUser> {
  const current = await getCurrentUser();
  if (!current) redirect(loginPath);
  return current;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const current = await getCurrentUser();
  if (!current) redirect("/sbbm-control/login");
  if (current.profile.role !== "admin") notFound();
  return current;
}

export async function requireOwnerOrAdmin(
  listingId: string
): Promise<CurrentUser> {
  const current = await requireUser();
  if (current.profile.role === "admin") return current;

  const db = await getDB();
  const row = await db
    .prepare("SELECT user_id FROM listings WHERE id = ?")
    .bind(listingId)
    .first<{ user_id: string | null }>();
  if (!row) notFound();
  if (row.user_id !== current.authUser.id) notFound();
  return current;
}
