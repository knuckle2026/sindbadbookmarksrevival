-- 2026-05-22: gclick.jp 由来のチェーン共通文を支店ごとにオリジナル書き直し
-- 「掲載内容をそのまま転載することはおやめ下さい」というポリシー対応。
-- 完全一致していた 9 件の description を支店ごとに差し替え。

-- KIDS グループ (5店)
UPDATE listings SET description='上野の売り専。ジャニ系・アスリート系・野郎系など幅広いキャストが在籍。アクセス上野駅。', updated_at=datetime('now') WHERE id='daa439e1-80c3-43b5-8aa3-5a6e1e916f5c';
UPDATE listings SET description='大阪の売り専。KIDSグループの関西拠点。多彩なタイプのキャストが揃う。', updated_at=datetime('now') WHERE id='da8a440b-3ab5-4b47-949e-0c8d20b54fa6';
UPDATE listings SET description='新橋の売り専。ビジネス街アクセス良好。ジャニ系・体育会系など幅広いキャスト。', updated_at=datetime('now') WHERE id='6bca0c0a-a308-4160-bffb-095ba5cf7ad2';
UPDATE listings SET description='横浜の売り専。KIDSグループ横浜店。多彩なキャストを揃え、初心者も歓迎。', updated_at=datetime('now') WHERE id='cf9db61f-6463-4d68-b7d7-38c152715955';
UPDATE listings SET description='渋谷の売り専。若手中心の幅広いタイプのキャストが在籍するKIDSグループ渋谷店。', updated_at=datetime('now') WHERE id='c26242b0-4208-411b-a947-55bdb7c33b4d';

-- 第一のチャクラ (2店)
UPDATE listings SET description='仙台の男性専門リラクゼーション。第一チャクラ活性化に特化した独自施術を提供。', updated_at=datetime('now') WHERE id='d63895ea-f33d-42ed-8927-50fb6bb71381';
UPDATE listings SET description='札幌の男性専門リラクゼーション。第一チャクラ活性化に特化した独自施術を提供。', updated_at=datetime('now') WHERE id='c3ee8a5e-1065-4a41-910b-04dda736525f';

-- トップスパ (2店)
UPDATE listings SET description='京都の売り専・ゲイマッサージ。体育会系・イケメン中心の多彩なスタッフが在籍。', updated_at=datetime('now') WHERE id='61bea140-19f8-4dfb-9811-a5e13140577d';
UPDATE listings SET description='名古屋の売り専・ゲイマッサージ。ジャニ系含む内面外見ともイケメンのスタッフ多数在籍。', updated_at=datetime('now') WHERE id='b1d500c3-9a60-4f88-8951-d7cbf9f440b0';
