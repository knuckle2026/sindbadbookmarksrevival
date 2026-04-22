import { getDB } from "../client";
import type { ProfileRow } from "../types";

export async function getProfile(id: string): Promise<ProfileRow | null> {
  const db = await getDB();
  return db.prepare("SELECT * FROM profiles WHERE id = ?").bind(id).first<ProfileRow>();
}

export async function upsertProfileOnSignIn(
  id: string,
  displayName: string
): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      `INSERT INTO profiles (id, display_name) VALUES (?, ?)
       ON CONFLICT(id) DO NOTHING`
    )
    .bind(id, displayName)
    .run();
}
