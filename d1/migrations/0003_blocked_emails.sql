-- ============================================
-- 0003_blocked_emails: 強制退会したメールアドレスの再登録ブロック
-- ============================================

CREATE TABLE blocked_emails (
  email      TEXT PRIMARY KEY COLLATE NOCASE,
  blocked_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  reason     TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_blocked_emails_created_at ON blocked_emails(created_at DESC);
