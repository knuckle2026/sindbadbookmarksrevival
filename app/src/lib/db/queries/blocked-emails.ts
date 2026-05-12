import { getDB } from "../client";
import type { BlockedEmailRow } from "../types";

export async function isEmailBlocked(email: string): Promise<boolean> {
  const db = await getDB();
  const row = await db
    .prepare("SELECT 1 AS x FROM blocked_emails WHERE email = ? COLLATE NOCASE")
    .bind(email.trim())
    .first<{ x: number }>();
  return !!row;
}

export async function addBlockedEmail(
  email: string,
  blockedBy: string | null,
  reason: string | null,
): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      `INSERT INTO blocked_emails (email, blocked_by, reason) VALUES (?, ?, ?)
       ON CONFLICT(email) DO NOTHING`,
    )
    .bind(email.trim(), blockedBy, reason)
    .run();
}

export async function removeBlockedEmail(email: string): Promise<void> {
  const db = await getDB();
  await db
    .prepare("DELETE FROM blocked_emails WHERE email = ? COLLATE NOCASE")
    .bind(email.trim())
    .run();
}

export async function listBlockedEmails(
  limit: number,
  offset: number,
): Promise<{ rows: BlockedEmailRow[]; total: number }> {
  const db = await getDB();
  const countRow = await db
    .prepare("SELECT COUNT(*) AS c FROM blocked_emails")
    .first<{ c: number }>();
  const total = countRow?.c ?? 0;
  const { results } = await db
    .prepare(
      `SELECT email, blocked_by, reason, created_at
       FROM blocked_emails
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(limit, offset)
    .all<BlockedEmailRow>();
  return { rows: results, total };
}
