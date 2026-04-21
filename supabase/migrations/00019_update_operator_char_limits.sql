-- 運営事務局関連テーブルの文字数制限を更新

-- feedback.body: 1000 → 200
ALTER TABLE feedback DROP CONSTRAINT feedback_body_check;
ALTER TABLE feedback ADD CONSTRAINT feedback_body_check
  CHECK (char_length(body) BETWEEN 1 AND 200);

-- faqs.question: 200 → 100
ALTER TABLE faqs DROP CONSTRAINT faqs_question_check;
ALTER TABLE faqs ADD CONSTRAINT faqs_question_check
  CHECK (char_length(question) BETWEEN 1 AND 100);

-- faqs.answer: 2000 → 200
ALTER TABLE faqs DROP CONSTRAINT faqs_answer_check;
ALTER TABLE faqs ADD CONSTRAINT faqs_answer_check
  CHECK (char_length(answer) BETWEEN 1 AND 200);

-- announcements.body: 2000 → 200
ALTER TABLE announcements DROP CONSTRAINT announcements_body_check;
ALTER TABLE announcements ADD CONSTRAINT announcements_body_check
  CHECK (char_length(body) BETWEEN 1 AND 200);
