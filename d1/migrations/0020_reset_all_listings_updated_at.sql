-- 既存 listing を全件一律「登録」表示に戻すため updated_at を created_at で上書き。
-- 過去の編集履歴 (updated_at) は失われるが、ユーザー明示要望に従う。
-- 今後の content 編集は updated_at が新規 bump され「更新」と表示される。

UPDATE listings SET updated_at = created_at;
