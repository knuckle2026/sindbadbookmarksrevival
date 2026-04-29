-- Seed: genres + categories
-- Preserves UUIDs from the Supabase production DB for continuity.

-- ========== GENRES ==========
INSERT INTO genres (id, slug, name, sort_order) VALUES
  ('6f7f62e6-9188-4bea-b71a-b19dd5583d90', 'bar-restaurant',  'バー・クラブ・飲食店', 1),
  ('8d9c701a-0adc-411c-b538-e849261d3bf5', 'hattenba',        'ハッテンバ',           2),
  ('b42c7136-7bf4-41b8-a12c-ce8d9cb26c8c', 'massage-urisen',  'マッサージ・売り専',   3),
  ('8c03b22a-116c-412f-9c01-575f438f01c9', 'video-gallery',   '動画・ギャラリー',     4),
  ('68254602-0411-4bdf-9544-608bf0b259ec', 'media-sns',       'メディア・SNS',        5),
  ('76c7d478-26d3-48f2-b5e2-5c1740e64020', 'org-consult',     '団体・相談先',         6),
  ('9238c7d0-4574-4edd-9736-c475ca792b19', 'matching',        '出会い',               7),
  ('3e52a6ca-01b4-4027-959e-99b9000dec49', 'fashion-beauty',  'ファッション・美容',   8),
  ('041e8df9-ffb8-46fe-b4e1-42620224daf0', 'mania',           'マニア系',             9),
  ('6315411b-dcad-4c76-844e-709ba9490cca', 'other',           'その他',              10);

-- ========== CATEGORIES ==========
-- bar-restaurant
INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
  ('6588c6df-0081-4a2e-98b9-eb4f578947a7', '6f7f62e6-9188-4bea-b71a-b19dd5583d90', 'gay-bar',    'ゲイバー',    1),
  ('41aec77e-9802-41ab-a9e1-4c8e1feff16d', '6f7f62e6-9188-4bea-b71a-b19dd5583d90', 'club',       'クラブ',      2),
  ('ef8db337-376d-4377-8cfa-4da6460cceed', '6f7f62e6-9188-4bea-b71a-b19dd5583d90', 'mixed-bar',  'ミックスバー', 3),
  ('3da30b41-7958-4cf9-801e-3fd23b99dd02', '6f7f62e6-9188-4bea-b71a-b19dd5583d90', 'tourist-bar','観光バー',    4),
  ('27ce14cd-4404-4807-a9d9-b41373abba9d', '6f7f62e6-9188-4bea-b71a-b19dd5583d90', 'dining',     '飲食',        5),
  ('89be9772-ee45-4ea7-8969-e38baa81a0db', '6f7f62e6-9188-4bea-b71a-b19dd5583d90', 'drag',       '女装',        6),
  ('9f0e9cb5-c12d-42c9-8d5c-d84a6b3c9111', '6f7f62e6-9188-4bea-b71a-b19dd5583d90', 'shemale',    'ニューハーフ', 7),
  ('87ea1bc3-87b7-4c82-9b10-02ab77d356b7', '6f7f62e6-9188-4bea-b71a-b19dd5583d90', 'lesbian-bar','レズバー',    8),
  ('75f646c8-a029-4be4-9f4a-476adf8ebcb3', '6f7f62e6-9188-4bea-b71a-b19dd5583d90', 'women-ok',   '女性入店可',  9);

-- hattenba
INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
  ('aa375b3a-e9d9-4437-8fbc-04682c5b7a26', '8d9c701a-0adc-411c-b538-e849261d3bf5', 'video-box', 'ビデオボックス', 1),
  ('90d54ea5-600f-40ab-b2db-1adb03d85cbd', '8d9c701a-0adc-411c-b538-e849261d3bf5', 'sauna',     'サウナ',         2),
  ('2daa87f7-453a-4e81-be74-e4a5ca37d127', '8d9c701a-0adc-411c-b538-e849261d3bf5', 'lodging',   '宿泊',           3);

-- massage-urisen
INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
  ('40438ed8-4f91-405c-ba30-ccdabaf533e5', 'b42c7136-7bf4-41b8-a12c-ce8d9cb26c8c', 'massage', 'マッサージ',             1),
  ('a7f36854-e518-4ee8-b84e-d2a103715036', 'b42c7136-7bf4-41b8-a12c-ce8d9cb26c8c', 'seitai',  '整体',                   2),
  ('32de353f-7649-4b5c-a6b0-d8288a25e08a', 'b42c7136-7bf4-41b8-a12c-ce8d9cb26c8c', 'oil',     'オイルマッサージ',       3),
  ('42582ab0-46b6-4fd9-aae9-9531a77324fb', 'b42c7136-7bf4-41b8-a12c-ce8d9cb26c8c', 'thai',    'タイ式マッサージ',       4),
  ('ea21af8f-78d1-4556-9bd0-fa709ee8aa13', 'b42c7136-7bf4-41b8-a12c-ce8d9cb26c8c', 'urisen',  '売り専',                 5),
  ('fb09d739-0a80-4d59-bca6-bddcdc845410', 'b42c7136-7bf4-41b8-a12c-ce8d9cb26c8c', 'newhalf', 'ニューハーフマッサージ', 6);

-- video-gallery
INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
  ('d1ef6bc4-49e1-41e4-8379-b0c3e6207f22', '8c03b22a-116c-412f-9c01-575f438f01c9', 'japan',            '日本',         1),
  ('4e031c89-463f-4953-9592-434100a8d3bd', '8c03b22a-116c-412f-9c01-575f438f01c9', 'world',            '海外',         2),
  ('2d809353-2c1a-4be7-a0b1-e8a5101b7ca7', '8c03b22a-116c-412f-9c01-575f438f01c9', 'asia',             'アジア',       3),
  ('88793640-a820-48fb-8c83-8998105d0f25', '8c03b22a-116c-412f-9c01-575f438f01c9', 'subscription-ppv', 'サブスク・PPV', 4),
  ('46d100c6-4092-4ef6-a53e-e0a11f3fd9a7', '8c03b22a-116c-412f-9c01-575f438f01c9', 'shop',             'ショップ',     5),
  ('b9517e19-2e27-40fb-ad93-799a9304a066', '8c03b22a-116c-412f-9c01-575f438f01c9', 'contents',         'BLコンテンツ', 6);

-- media-sns
INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
  ('1b478a3f-e020-4e83-8ef6-e18f2ab7d232', '68254602-0411-4bdf-9544-608bf0b259ec', 'influencer', 'インフルエンサー',     1),
  ('1fb0fac6-0053-44d6-a830-536f71a8ed97', '68254602-0411-4bdf-9544-608bf0b259ec', 'youtube',    'Youtube',             2),
  ('3e38e0f9-2291-49fa-9a1b-eaccad28bebb', '68254602-0411-4bdf-9544-608bf0b259ec', 'tiktok',     'Tiktok',              3),
  ('2c384d72-496c-460a-b7d2-0357089cdb87', '68254602-0411-4bdf-9544-608bf0b259ec', 'liver',      'ライバー',            4),
  ('ddd04809-dd7c-490d-9da2-81737263fe21', '68254602-0411-4bdf-9544-608bf0b259ec', 'blog',       '個人サイト・ブログ',   5),
  ('276f7b49-3f51-4101-821b-63507898bf4a', '68254602-0411-4bdf-9544-608bf0b259ec', 'publishing', '出版',                6);

-- org-consult
INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
  ('cebccc04-94c8-461a-9c52-14b1c9a18580', '76c7d478-26d3-48f2-b5e2-5c1740e64020', 'npo',         'NPO',     1),
  ('8a354d35-d35a-4d0a-8020-2902a5110565', '76c7d478-26d3-48f2-b5e2-5c1740e64020', 'volunteer',   '行政',    2),
  ('613af953-cc80-45b3-996f-0c5056f9f425', '76c7d478-26d3-48f2-b5e2-5c1740e64020', 'circle',      'サークル', 3),
  ('fd92caa5-e861-4c02-849e-e653545f6b4c', '76c7d478-26d3-48f2-b5e2-5c1740e64020', 'medical-org', '医療機関', 4);

-- matching
INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
  ('f523c408-a42b-42fc-9b8e-9e9e400fa19c', '9238c7d0-4574-4edd-9736-c475ca792b19', 'app',         'マッチングアプリ',     1),
  ('72539a4e-4bff-4bb4-8a5a-e8e19498aa1d', '9238c7d0-4574-4edd-9736-c475ca792b19', 'matchmaking', 'お見合いサービス',     2),
  ('d09dd5f2-219e-4c17-b7f0-3e62c0b75e13', '9238c7d0-4574-4edd-9736-c475ca792b19', 'board',       '掲示板',              3);

-- fashion-beauty
INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
  ('75711450-ea1e-46f1-b997-f0e3325846b0', '3e52a6ca-01b4-4027-959e-99b9000dec49', 'hair',         'ヘアサロン',   1),
  ('b050b3f8-1c11-43d7-8e1c-007a9d34cc4d', '3e52a6ca-01b4-4027-959e-99b9000dec49', 'makeup',       'メイク',       2),
  ('4d8c4294-2611-40a0-8db3-49b9de5aed83', '3e52a6ca-01b4-4027-959e-99b9000dec49', 'esthetic',     'エステ',       3),
  ('ade3c21c-36e5-4b5c-8fe3-653bb48ebad8', '3e52a6ca-01b4-4027-959e-99b9000dec49', 'hair-removal', '脱毛',         4),
  ('d55600c2-5fe1-4b71-b784-960145e36a18', '3e52a6ca-01b4-4027-959e-99b9000dec49', 'tanning',      'タンニング',   5),
  ('05b175ad-bb14-48c9-8569-f99884e45a4c', '3e52a6ca-01b4-4027-959e-99b9000dec49', 'fitness',      'フィットネス', 6),
  ('b99f4943-6d48-4b3c-a030-6680dd03b74e', '3e52a6ca-01b4-4027-959e-99b9000dec49', 'underwear',    '下着',         7),
  ('bdbe8cf4-2753-44dd-90a3-ac629f420c21', '3e52a6ca-01b4-4027-959e-99b9000dec49', 'shop',         'ショップ',     8),
  ('1d4d64b1-7e90-41a3-a013-3ae0db52fcb6', '3e52a6ca-01b4-4027-959e-99b9000dec49', 'medical',      '医療機関',     9);

-- mania
INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
  ('c36b3598-26fb-4c4d-a6dd-dd6c58d6639c', '041e8df9-ffb8-46fe-b4e1-42620224daf0', 'sm',       'SM',            1),
  ('8359b676-d86e-4cce-821e-35aa14456eb1', '041e8df9-ffb8-46fe-b4e1-42620224daf0', 'exposure', '露出',          2),
  ('3c37e86e-4a80-4583-8b19-ffb42a6c8d19', '041e8df9-ffb8-46fe-b4e1-42620224daf0', 'chubby',   'デブ専',        3),
  ('2526f3d0-2174-4dd6-b507-cd56bd163a9b', '041e8df9-ffb8-46fe-b4e1-42620224daf0', 'mature',   'フケ専',        4),
  ('d889fa27-2f54-495d-a194-668cd736408f', '041e8df9-ffb8-46fe-b4e1-42620224daf0', 'bondage',  '緊縛',          5),
  ('a89d8dad-d968-4e71-81fd-38da55208be4', '041e8df9-ffb8-46fe-b4e1-42620224daf0', 'kyoupan',  '競パン',        6),
  ('4348059e-21af-4a13-97b2-3ca912968d41', '041e8df9-ffb8-46fe-b4e1-42620224daf0', 'fundoshi', '褌',            7),
  ('af122967-1f89-461e-87d7-6ffca5a7887f', '041e8df9-ffb8-46fe-b4e1-42620224daf0', 'brief',    'ブリーフ',      8),
  ('e7afaacc-d8cf-4268-a805-d4677a6df2b7', '041e8df9-ffb8-46fe-b4e1-42620224daf0', 'uniform',  'ユニフォーム',  9),
  ('c7648b81-6506-4337-81c3-dd144a54c215', '041e8df9-ffb8-46fe-b4e1-42620224daf0', 'rubber',   'ラバー',       10),
  ('6be8e722-b0b2-4719-91af-8f43d6492823', '041e8df9-ffb8-46fe-b4e1-42620224daf0', 'cosplay',  'コスプレ',     11),
  ('aa4d8ea5-24f0-43b5-8338-12e1ad5ce6f0', '041e8df9-ffb8-46fe-b4e1-42620224daf0', 'kigurumi', '着ぐるみ',     12),
  ('487e4f25-0731-4490-926b-248d01c529c1', '041e8df9-ffb8-46fe-b4e1-42620224daf0', 'zentai',   'ゼンタイ',     13);

-- other
INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
  ('fe6d6084-5c1b-4b31-981a-ac4bf0c603ac', '6315411b-dcad-4c76-844e-709ba9490cca', 'abroad',      '海外旅行情報', 1),
  ('3d193c7d-68b0-43d6-9400-b60e74e93953', '6315411b-dcad-4c76-844e-709ba9490cca', 'fortune',     '占い',         2),
  ('98e68426-9eae-472f-8d59-446a44c9424f', '6315411b-dcad-4c76-844e-709ba9490cca', 'dance',       'ダンス',       3),
  ('621098ea-b3fe-4b97-ab53-a19a541b315c', '6315411b-dcad-4c76-844e-709ba9490cca', 'yoga',        'ヨガ',         4),
  ('f110f8b8-ba32-4d2b-afde-0cc12d76c43c', '6315411b-dcad-4c76-844e-709ba9490cca', 'dessin',      'デッサン',     5),
  ('ab3e4611-cb92-467c-bfd6-07970455693e', '6315411b-dcad-4c76-844e-709ba9490cca', 'useful-site', '便利サイト',   6),
  ('3c880559-b22f-4011-8754-7b74e1571f06', '6315411b-dcad-4c76-844e-709ba9490cca', 'love hotel',  'ラブホテル',   7);
