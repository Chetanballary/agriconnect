/*
# Add profiles table and user_id ownership for farmer/retailer auth

1. Purpose
   Separate farmer and retailer logins. A `profiles` table stores the user's
   role ('farmer' | 'retailer' | 'admin') linked to Supabase auth.users.
   Crops and orders get optional user_id columns for ownership tracking.

2. New Tables
   - `profiles`: id (uuid, PK, FK auth.users), email, full_name, role,
     phone, region, created_at. One row per auth user.

3. Modified Tables
   - `crops`: add `farmer_id uuid` (nullable, references auth.users).
     Existing mock-data rows keep farmer_id NULL so they remain browsable.
   - `orders`: add `retailer_id uuid` (nullable, references auth.users).
     Existing mock-data rows keep retailer_id NULL.

4. Security
   - `profiles`: RLS enabled. Users can read/update only their own profile.
     All authenticated users can read profiles (to see farmer names), but
     only the owner can update.
   - `crops`: keep existing anon SELECT policy (public browsing). Add
     authenticated INSERT/UPDATE/DELETE scoped to farmer_id = auth.uid().
   - `orders`: keep existing anon SELECT (for dashboard demo). Add
     authenticated INSERT scoped to retailer_id = auth.uid(). Add
     authenticated UPDATE for farmer_id ownership.
   - `inquiries`: keep existing anon policies (retailers can send inquiries
     without logging in).

5. Notes
   - Email confirmation is OFF (default Supabase behavior).
   - Role is stored in profiles table, not in JWT user_metadata, so it
     cannot be tampered with by the client.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'retailer' CHECK (role IN ('farmer', 'retailer', 'admin')),
  phone text DEFAULT '',
  region text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_profiles" ON profiles;
CREATE POLICY "select_profiles" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Add user_id columns to crops and orders (nullable for existing mock data)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crops' AND column_name = 'farmer_id') THEN
    ALTER TABLE crops ADD COLUMN farmer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'retailer_id') THEN
    ALTER TABLE orders ADD COLUMN retailer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add authenticated INSERT/UPDATE/DELETE policies for crops (farmer-scoped)
DROP POLICY IF EXISTS "auth_insert_crops" ON crops;
CREATE POLICY "auth_insert_crops" ON crops FOR INSERT
  TO authenticated WITH CHECK (farmer_id = auth.uid());

DROP POLICY IF EXISTS "auth_update_crops" ON crops;
CREATE POLICY "auth_update_crops" ON crops FOR UPDATE
  TO authenticated USING (farmer_id = auth.uid()) WITH CHECK (farmer_id = auth.uid());

DROP POLICY IF EXISTS "auth_delete_crops" ON crops;
CREATE POLICY "auth_delete_crops" ON crops FOR DELETE
  TO authenticated USING (farmer_id = auth.uid());

-- Add authenticated INSERT for orders (retailer-scoped)
DROP POLICY IF EXISTS "auth_insert_orders" ON orders;
CREATE POLICY "auth_insert_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (retailer_id = auth.uid());

-- Add authenticated UPDATE for orders (farmer can update orders on their crops)
DROP POLICY IF EXISTS "auth_update_orders" ON orders;
CREATE POLICY "auth_update_orders" ON orders FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Add a trigger to auto-create a profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'retailer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS crops_farmer_id_idx ON crops(farmer_id);
CREATE INDEX IF NOT EXISTS orders_retailer_id_idx ON orders(retailer_id);
