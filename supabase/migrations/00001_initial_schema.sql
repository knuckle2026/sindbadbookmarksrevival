-- ============================================
-- sindbadbookmarks: Initial Schema Migration
-- ============================================

-- ========== ENUM TYPES ==========

CREATE TYPE listing_type AS ENUM ('shop', 'organization', 'media');
CREATE TYPE friendliness_level AS ENUM ('Dedicated', 'Friendly', 'Ally');
CREATE TYPE listing_status AS ENUM ('published', 'hidden');
CREATE TYPE category_group AS ENUM ('purpose', 'industry');
CREATE TYPE user_role AS ENUM ('visitor', 'contributor', 'admin');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed');

-- ========== PROFILES ==========

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'contributor',
  is_suspended boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE profiles IS 'User profiles linked to Supabase Auth';

-- ========== CATEGORIES (Master) ==========

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_type category_group NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE categories IS 'Category master for purpose and industry classifications';

-- ========== LISTINGS ==========

CREATE TABLE listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type listing_type NOT NULL,
  title text NOT NULL,
  description text,
  address text,
  latitude float8,
  longitude float8,
  website_url text,
  friendliness friendliness_level,
  status listing_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE listings IS 'Main table for registered shops, organizations, and media';

CREATE INDEX idx_listings_type ON listings(type);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_friendliness ON listings(friendliness);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);

-- ========== LISTING_CATEGORIES (Junction) ==========

CREATE TABLE listing_categories (
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, category_id)
);

COMMENT ON TABLE listing_categories IS 'Many-to-many relationship between listings and categories';

CREATE INDEX idx_listing_categories_category ON listing_categories(category_id);

-- ========== REPORTS ==========

CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status report_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE reports IS 'Inappropriate content reports from visitors';

CREATE INDEX idx_reports_listing ON reports(listing_id);
CREATE INDEX idx_reports_status ON reports(status);

-- ========== UPDATED_AT TRIGGER ==========

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========== ROW LEVEL SECURITY ==========

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- --- profiles ---
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- --- listings ---
CREATE POLICY "listings_select_published" ON listings
  FOR SELECT USING (status = 'published');

CREATE POLICY "listings_insert_authenticated" ON listings
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_suspended = false
    )
  );

CREATE POLICY "listings_update_own" ON listings
  FOR UPDATE USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_suspended = false
    )
  );

-- --- listing_categories ---
CREATE POLICY "listing_categories_select_all" ON listing_categories
  FOR SELECT USING (true);

CREATE POLICY "listing_categories_insert_authenticated" ON listing_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings WHERE id = listing_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "listing_categories_delete_own" ON listing_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM listings WHERE id = listing_id AND user_id = auth.uid()
    )
  );

-- --- categories ---
CREATE POLICY "categories_select_all" ON categories
  FOR SELECT USING (true);

-- --- reports ---
CREATE POLICY "reports_insert_all" ON reports
  FOR INSERT WITH CHECK (true);

-- ========== SEED: CATEGORIES ==========

INSERT INTO categories (group_type, name, slug, sort_order) VALUES
  -- Purpose (目的別)
  ('purpose', '交流・出会い', 'social', 1),
  ('purpose', '支援・相談', 'support', 2),
  ('purpose', 'ナイトライフ', 'nightlife', 3),
  ('purpose', '文化・アート', 'culture', 4),
  ('purpose', '情報・メディア', 'information', 5),
  ('purpose', '暮らし・サービス', 'lifestyle', 6),
  ('purpose', '権利・アドボカシー', 'advocacy', 7),
  -- Industry (業態別)
  ('industry', '飲食', 'food-drink', 1),
  ('industry', '宿泊', 'accommodation', 2),
  ('industry', '美容・ファッション', 'beauty-fashion', 3),
  ('industry', '医療・メンタルヘルス', 'healthcare', 4),
  ('industry', '法律・士業', 'legal', 5),
  ('industry', 'IT・テクノロジー', 'it-tech', 6),
  ('industry', 'エンターテインメント', 'entertainment', 7),
  ('industry', '教育・研究', 'education', 8),
  ('industry', 'その他', 'other', 9);

-- ========== PROFILE AUTO-CREATION ON SIGNUP ==========

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'ユーザー'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========== DASHBOARD RPC FUNCTIONS ==========

CREATE OR REPLACE FUNCTION get_dashboard_counts()
RETURNS TABLE (
  total_published bigint,
  shop_count bigint,
  org_count bigint,
  media_count bigint
) LANGUAGE sql STABLE AS $$
  SELECT
    COUNT(*) FILTER (WHERE status = 'published') AS total_published,
    COUNT(*) FILTER (WHERE type = 'shop' AND status = 'published') AS shop_count,
    COUNT(*) FILTER (WHERE type = 'organization' AND status = 'published') AS org_count,
    COUNT(*) FILTER (WHERE type = 'media' AND status = 'published') AS media_count
  FROM listings;
$$;

CREATE OR REPLACE FUNCTION get_dashboard_category_counts()
RETURNS TABLE (
  category_id uuid,
  group_type category_group,
  name text,
  slug text,
  sort_order integer,
  listing_count bigint
) LANGUAGE sql STABLE AS $$
  SELECT
    c.id AS category_id,
    c.group_type,
    c.name,
    c.slug,
    c.sort_order,
    COUNT(lc.listing_id) FILTER (WHERE l.status = 'published') AS listing_count
  FROM categories c
  LEFT JOIN listing_categories lc ON lc.category_id = c.id
  LEFT JOIN listings l ON l.id = lc.listing_id
  GROUP BY c.id, c.group_type, c.name, c.slug, c.sort_order
  ORDER BY c.group_type, c.sort_order;
$$;

CREATE OR REPLACE FUNCTION get_dashboard_friendliness_counts()
RETURNS TABLE (
  friendliness friendliness_level,
  listing_count bigint
) LANGUAGE sql STABLE AS $$
  SELECT
    friendliness,
    COUNT(*) AS listing_count
  FROM listings
  WHERE status = 'published' AND friendliness IS NOT NULL
  GROUP BY friendliness;
$$;
