-- 運営事務局ページ用テーブル（announcements / faqs / feedback）

-- ========== ANNOUNCEMENTS ==========

CREATE TABLE announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 誰でも閲覧可
CREATE POLICY "public_select_announcements" ON announcements
  FOR SELECT USING (true);

-- Admin のみ CRUD
CREATE POLICY "admin_manage_announcements" ON announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ========== FAQS ==========

CREATE TABLE faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL CHECK (char_length(question) BETWEEN 1 AND 200),
  answer text NOT NULL CHECK (char_length(answer) BETWEEN 1 AND 2000),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_faqs_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_faqs" ON faqs
  FOR SELECT USING (true);

CREATE POLICY "admin_manage_faqs" ON faqs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ========== FEEDBACK ==========

CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 誰でも送信可（匿名OK）
CREATE POLICY "anyone_insert_feedback" ON feedback
  FOR INSERT WITH CHECK (true);

-- Admin のみ閲覧可
CREATE POLICY "admin_select_feedback" ON feedback
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin のみ削除可
CREATE POLICY "admin_delete_feedback" ON feedback
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
