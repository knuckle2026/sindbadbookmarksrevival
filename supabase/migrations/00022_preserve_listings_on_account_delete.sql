-- Preserve listings when the owning account is deleted.
-- Previously listings.user_id had ON DELETE CASCADE, so deleting auth.users
-- removed the profile and all their listings. Change to SET NULL so listings
-- remain (orphaned / anonymized) after account deletion.

ALTER TABLE listings DROP CONSTRAINT listings_user_id_fkey;

ALTER TABLE listings ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE listings
  ADD CONSTRAINT listings_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
