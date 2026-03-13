-- ManageMyGarage - Initial Schema Migration
-- Creates all tables, indexes, RLS policies, triggers, and storage buckets

-- ═══════════════════════════════════════════════════════
-- TABLES
-- ═══════════════════════════════════════════════════════

-- Vehicles
CREATE TABLE vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  version text,
  year int NOT NULL CHECK (year >= 1900 AND year <= 2100),
  mileage int NOT NULL CHECK (mileage >= 0),
  vin text UNIQUE,
  license_plate text,
  fuel_type text NOT NULL CHECK (fuel_type IN ('essence', 'diesel', 'hybrid', 'electric')),
  transmission text NOT NULL CHECK (transmission IN ('manual', 'automatic')),
  color text,
  doors int CHECK (doors >= 1 AND doors <= 7),
  purchase_price numeric(10,2) NOT NULL CHECK (purchase_price >= 0),
  purchase_date date NOT NULL,
  seller_type text NOT NULL CHECK (seller_type IN ('particular', 'professional')),
  seller_name text,
  seller_phone text,
  notes text,
  status text NOT NULL DEFAULT 'purchased' CHECK (status IN (
    'purchased', 'technical_control', 'bodywork', 'mechanic',
    'cleaning', 'ready_for_sale', 'sold'
  )),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Vehicle Status History
CREATE TABLE vehicle_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  from_status text,
  to_status text NOT NULL CHECK (to_status IN (
    'purchased', 'technical_control', 'bodywork', 'mechanic',
    'cleaning', 'ready_for_sale', 'sold'
  )),
  changed_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

-- Expenses
CREATE TABLE expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL CHECK (category IN (
    'bodywork', 'mechanic', 'technical_control', 'cleaning', 'administrative', 'other'
  )),
  provider text,
  amount_ht numeric(10,2) NOT NULL CHECK (amount_ht >= 0),
  vat_rate numeric(5,2) NOT NULL DEFAULT 20.00 CHECK (vat_rate >= 0 AND vat_rate <= 100),
  amount_ttc numeric(10,2) NOT NULL CHECK (amount_ttc >= 0),
  expense_date date NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  invoice_ref text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Media
CREATE TABLE media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('photo', 'document')),
  category text,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size int CHECK (file_size >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Sales
CREATE TABLE sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  invoice_number text UNIQUE NOT NULL,
  sale_date date NOT NULL,
  sale_price numeric(10,2) NOT NULL CHECK (sale_price >= 0),
  payment_method text NOT NULL CHECK (payment_method IN ('transfer', 'check', 'cash', 'financing')),
  mileage_at_sale int CHECK (mileage_at_sale >= 0),
  warranty text CHECK (warranty IN ('none', '3_months', '6_months', '1_year')),
  client_civility text CHECK (client_civility IN ('mr', 'mrs', 'ms')),
  client_firstname text NOT NULL,
  client_lastname text NOT NULL,
  client_address text,
  client_zip text,
  client_city text,
  client_country text NOT NULL DEFAULT 'France',
  client_phone text,
  client_email text,
  client_type text NOT NULL DEFAULT 'particular' CHECK (client_type IN ('particular', 'professional')),
  company_name text,
  siret text,
  vat_number text,
  invoice_pdf_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════

CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_brand ON vehicles(brand);
CREATE INDEX idx_vehicle_status_history_vehicle_id ON vehicle_status_history(vehicle_id);
CREATE INDEX idx_expenses_vehicle_id ON expenses(vehicle_id);
CREATE INDEX idx_media_vehicle_id ON media(vehicle_id);
CREATE INDEX idx_sales_vehicle_id ON sales(vehicle_id);

-- ═══════════════════════════════════════════════════════
-- TRIGGER: auto-update updated_at on vehicles
-- ═══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Vehicles: user can only access their own vehicles
CREATE POLICY "Users can view own vehicles"
  ON vehicles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own vehicles"
  ON vehicles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own vehicles"
  ON vehicles FOR DELETE
  USING (user_id = auth.uid());

-- Vehicle Status History: access through vehicle ownership
CREATE POLICY "Users can view own vehicle status history"
  ON vehicle_status_history FOR SELECT
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own vehicle status history"
  ON vehicle_status_history FOR INSERT
  WITH CHECK (vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own vehicle status history"
  ON vehicle_status_history FOR UPDATE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own vehicle status history"
  ON vehicle_status_history FOR DELETE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid()));

-- Expenses: access through vehicle ownership
CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  WITH CHECK (vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid()));

-- Media: access through vehicle ownership
CREATE POLICY "Users can view own media"
  ON media FOR SELECT
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own media"
  ON media FOR INSERT
  WITH CHECK (vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own media"
  ON media FOR UPDATE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own media"
  ON media FOR DELETE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid()));

-- Sales: access through vehicle ownership
CREATE POLICY "Users can view own sales"
  ON sales FOR SELECT
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own sales"
  ON sales FOR INSERT
  WITH CHECK (vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own sales"
  ON sales FOR UPDATE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own sales"
  ON sales FOR DELETE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid()));

-- ═══════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- ═══════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('vehicle-photos', 'vehicle-photos', false),
  ('vehicle-documents', 'vehicle-documents', false);

-- Storage policies: users can manage their own files
-- Photos bucket
CREATE POLICY "Users can upload vehicle photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vehicle-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own vehicle photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'vehicle-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own vehicle photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vehicle-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Documents bucket
CREATE POLICY "Users can upload vehicle documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vehicle-documents'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own vehicle documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'vehicle-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own vehicle documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vehicle-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
