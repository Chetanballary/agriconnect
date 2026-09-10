/*
# Agri Direct Marketplace Schema

## Overview
Creates the core database tables for a farmer-to-retailer digital marketplace.
The app has authentication with three roles: FARMER, RETAILER, and ADMIN.
Farmers create crop listings; retailers browse and place orders; farmers manage order delivery status.

## New Tables
1. `profiles` — extends auth.users with role (FARMER/RETAILER/ADMIN), full_name, farm_name, location, phone, created_at
2. `crops` — farmer listings: crop name, category, price per unit, quantity, harvest date, location, image_url, description, user_id (farmer), created_at
3. `orders` — retailer orders: crop_id, retailer_id, farmer_id, quantity, total_price, status (placed/packed/in_transit/delivered), created_at
4. `inquiries` — retailer-to-farmer messages about specific crops: crop_id, retailer_id, farmer_id, message, created_at

## Security
- RLS enabled on all tables.
- profiles: users can read all profiles (marketplace needs farmer names), update only their own.
- crops: everyone authenticated can read (marketplace browsing); only owner farmer can insert/update/delete.
- orders: retailers create their own orders; farmers see orders for their crops; farmers update status of their crops' orders.
- inquiries: retailers send inquiries; farmers see inquiries for their crops; retailers see their own inquiries.
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'RETAILER' CHECK (role IN ('FARMER', 'RETAILER', 'ADMIN')),
  full_name text NOT NULL,
  farm_name text,
  location text,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Crops table
CREATE TABLE IF NOT EXISTS crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  price_per_unit numeric NOT NULL CHECK (price_per_unit > 0),
  unit text NOT NULL DEFAULT 'kg',
  quantity_available numeric NOT NULL CHECK (quantity_available >= 0),
  harvest_date date,
  location text NOT NULL,
  image_url text,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crops_select_all" ON crops;
CREATE POLICY "crops_select_all" ON crops FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "crops_insert_own" ON crops;
CREATE POLICY "crops_insert_own" ON crops FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "crops_update_own" ON crops;
CREATE POLICY "crops_update_own" ON crops FOR UPDATE
  TO authenticated USING (auth.uid() = farmer_id) WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "crops_delete_own" ON crops;
CREATE POLICY "crops_delete_own" ON crops FOR DELETE
  TO authenticated USING (auth.uid() = farmer_id);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  retailer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity numeric NOT NULL CHECK (quantity > 0),
  total_price numeric NOT NULL CHECK (total_price > 0),
  status text NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'packed', 'in_transit', 'delivered', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_parties" ON orders;
CREATE POLICY "orders_select_parties" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = retailer_id OR auth.uid() = farmer_id);

DROP POLICY IF EXISTS "orders_insert_retailer" ON orders;
CREATE POLICY "orders_insert_retailer" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = retailer_id);

DROP POLICY IF EXISTS "orders_update_farmer_status" ON orders;
CREATE POLICY "orders_update_farmer_status" ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = farmer_id) WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "orders_delete_retailer" ON orders;
CREATE POLICY "orders_delete_retailer" ON orders FOR DELETE
  TO authenticated USING (auth.uid() = retailer_id);

-- Inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  retailer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inquiries_select_parties" ON inquiries;
CREATE POLICY "inquiries_select_parties" ON inquiries FOR SELECT
  TO authenticated USING (auth.uid() = retailer_id OR auth.uid() = farmer_id);

DROP POLICY IF EXISTS "inquiries_insert_retailer" ON inquiries;
CREATE POLICY "inquiries_insert_retailer" ON inquiries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = retailer_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crops_farmer_id ON crops(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crops_category ON crops(category);
CREATE INDEX IF NOT EXISTS idx_orders_crop_id ON orders(crop_id);
CREATE INDEX IF NOT EXISTS idx_orders_retailer_id ON orders(retailer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer_id ON orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_crop_id ON inquiries(crop_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_farmer_id ON inquiries(farmer_id);
