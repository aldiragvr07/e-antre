-- Trigger: Otomatis sync user dari auth.users ke public.users saat signup
-- Ini memastikan setiap user yang register otomatis masuk ke tabel public.users

-- 1. Buat function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, avatar_url, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    email = COALESCE(EXCLUDED.email, public.users.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Buat trigger pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Sync semua user yang sudah ada (yang belum masuk ke public.users)
INSERT INTO public.users (id, full_name, email, created_at)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', ''),
  email,
  created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;
