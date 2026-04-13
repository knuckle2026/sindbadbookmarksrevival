-- 本番DB適用予定
-- Admin用 RLS ポリシー追加

-- Admin can SELECT all listings (including unpublished/other users')
CREATE POLICY "admin_select_all_listings" ON listings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin can UPDATE any listing
CREATE POLICY "admin_update_all_listings" ON listings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin can SELECT all profiles (to show creator info)
CREATE POLICY "admin_select_all_profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin can manage all categories (SELECT/INSERT/UPDATE/DELETE)
CREATE POLICY "admin_manage_categories" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin-only function to get user emails from auth.users
CREATE OR REPLACE FUNCTION get_user_emails(user_ids uuid[])
RETURNS TABLE(id uuid, email text)
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT au.id, au.email::text
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$$ LANGUAGE plpgsql;

-- Set admin role
UPDATE profiles SET role = 'admin'
WHERE id = '0ad50f8a-71e9-47d2-bf9c-9dfa7c0fedd8';
