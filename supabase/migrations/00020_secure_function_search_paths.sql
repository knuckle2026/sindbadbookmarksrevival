-- Fix mutable search_path on functions (Supabase security advisor)
-- Lock search_path to '' and fully qualify references as public.xxx
-- Also drop 3 unused dashboard RPCs that reference a long-removed `type` column.

DROP FUNCTION IF EXISTS public.get_dashboard_counts();
DROP FUNCTION IF EXISTS public.get_dashboard_category_counts();
DROP FUNCTION IF EXISTS public.get_dashboard_friendliness_counts();

CREATE OR REPLACE FUNCTION public.increment_click_count(listing_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
  UPDATE public.listings SET click_count = click_count + 1 WHERE id = listing_id;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'ユーザー'));
  RETURN NEW;
END;
$function$;
