-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 002: Multi-tenant Garage System
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Helper functions ────────────────────────────────────────────────────

-- Generate a readable 6-char invite code (excludes ambiguous I, O, 0, 1)
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text := '';
  i int;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS(SELECT 1 FROM garages WHERE invite_code = code); 
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── New tables ──────────────────────────────────────────────────────────

CREATE TABLE garages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  siret text,
  phone text,
  email text,
  invite_code text UNIQUE NOT NULL DEFAULT generate_invite_code(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE garage_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id uuid REFERENCES garages(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_email text,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(garage_id, user_id)
);

-- ─── Indexes ─────────────────────────────────────────────────────────────

CREATE INDEX idx_garages_invite_code ON garages(invite_code);
CREATE INDEX idx_garage_members_user_id ON garage_members(user_id);
CREATE INDEX idx_garage_members_garage_id ON garage_members(garage_id);
CREATE INDEX idx_garage_members_status ON garage_members(status);

-- ─── Triggers ────────────────────────────────────────────────────────────

CREATE TRIGGER garages_updated_at
  BEFORE UPDATE ON garages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER garage_members_updated_at
  BEFORE UPDATE ON garage_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Migrate vehicles: user_id → garage_id ───────────────────────────────

-- 1. Drop all old RLS policies that depend on vehicles.user_id FIRST
DROP POLICY IF EXISTS "Users can view own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can insert own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can update own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can delete own vehicles" ON vehicles;

DROP POLICY IF EXISTS "Users can view own vehicle status history" ON vehicle_status_history;
DROP POLICY IF EXISTS "Users can insert own vehicle status history" ON vehicle_status_history;
DROP POLICY IF EXISTS "Users can update own vehicle status history" ON vehicle_status_history;
DROP POLICY IF EXISTS "Users can delete own vehicle status history" ON vehicle_status_history;

DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;

DROP POLICY IF EXISTS "Users can view own media" ON media;
DROP POLICY IF EXISTS "Users can insert own media" ON media;
DROP POLICY IF EXISTS "Users can update own media" ON media;
DROP POLICY IF EXISTS "Users can delete own media" ON media;

DROP POLICY IF EXISTS "Users can view own sales" ON sales;
DROP POLICY IF EXISTS "Users can insert own sales" ON sales;
DROP POLICY IF EXISTS "Users can update own sales" ON sales;
DROP POLICY IF EXISTS "Users can delete own sales" ON sales;

DROP POLICY IF EXISTS "Users can upload vehicle photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own vehicle photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own vehicle photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload vehicle documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own vehicle documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own vehicle documents" ON storage.objects;

-- 2. Now safely add garage_id and drop user_id
ALTER TABLE vehicles ADD COLUMN garage_id uuid REFERENCES garages(id) ON DELETE CASCADE;

DROP INDEX IF EXISTS idx_vehicles_user_id;

-- Drop old column (existing data will be lost — use seed to repopulate)
ALTER TABLE vehicles DROP COLUMN user_id;
ALTER TABLE vehicles ALTER COLUMN garage_id SET NOT NULL;

CREATE INDEX idx_vehicles_garage_id ON vehicles(garage_id);

-- ─── RLS helper functions (SECURITY DEFINER to avoid circular checks) ───

-- Returns all garage IDs where the current user has active membership
CREATE OR REPLACE FUNCTION get_user_garage_ids()
RETURNS SETOF uuid AS $$
  SELECT garage_id FROM garage_members
  WHERE user_id = auth.uid() AND status = 'active';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_active_member(p_garage_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM garage_members
    WHERE garage_id = p_garage_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_garage_admin(p_garage_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM garage_members
    WHERE garage_id = p_garage_id
      AND user_id = auth.uid()
      AND status = 'active'
      AND role IN ('owner', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_garage_owner(p_garage_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM garage_members
    WHERE garage_id = p_garage_id
      AND user_id = auth.uid()
      AND status = 'active'
      AND role = 'owner'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── RPC: regenerate invite code ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION regenerate_invite_code(p_garage_id uuid)
RETURNS text AS $$
DECLARE
  new_code text;
BEGIN
  IF NOT is_garage_admin(p_garage_id) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  new_code := generate_invite_code();
  UPDATE garages SET invite_code = new_code WHERE id = p_garage_id;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── garages ─────────────────────────────────────────────────────────────

ALTER TABLE garages ENABLE ROW LEVEL SECURITY;

-- Allow members to view their garages + allow lookup by invite_code for joining
CREATE POLICY "Authenticated users can view garages" ON garages FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create garages" ON garages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "Admins can update garage" ON garages FOR UPDATE
  USING (is_garage_admin(id))
  WITH CHECK (is_garage_admin(id));

CREATE POLICY "Owner can delete garage" ON garages FOR DELETE
  USING (is_garage_owner(id));

-- ─── garage_members ─────────────────────────────────────────────────────

ALTER TABLE garage_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view garage members" ON garage_members FOR SELECT
  USING (
    garage_id IN (SELECT get_user_garage_ids())
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can request to join" ON garage_members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Admins can update members" ON garage_members FOR UPDATE
  USING (
    is_garage_admin(garage_id)
    OR user_id = auth.uid()
  );

CREATE POLICY "Admins can delete members" ON garage_members FOR DELETE
  USING (is_garage_admin(garage_id) OR user_id = auth.uid());

-- ─── vehicles (replace old policies) ────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can insert own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can update own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can delete own vehicles" ON vehicles;

CREATE POLICY "Garage members can view vehicles" ON vehicles FOR SELECT
  USING (is_active_member(garage_id));

CREATE POLICY "Garage members can insert vehicles" ON vehicles FOR INSERT
  WITH CHECK (is_active_member(garage_id));

CREATE POLICY "Garage members can update vehicles" ON vehicles FOR UPDATE
  USING (is_active_member(garage_id))
  WITH CHECK (is_active_member(garage_id));

CREATE POLICY "Garage members can delete vehicles" ON vehicles FOR DELETE
  USING (is_active_member(garage_id));

-- ─── vehicle_status_history (replace old policies) ──────────────────────

DROP POLICY IF EXISTS "Users can view own vehicle status history" ON vehicle_status_history;
DROP POLICY IF EXISTS "Users can insert own vehicle status history" ON vehicle_status_history;
DROP POLICY IF EXISTS "Users can update own vehicle status history" ON vehicle_status_history;
DROP POLICY IF EXISTS "Users can delete own vehicle status history" ON vehicle_status_history;

CREATE POLICY "Garage members can view vehicle status history" ON vehicle_status_history FOR SELECT
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE is_active_member(garage_id)));

CREATE POLICY "Garage members can insert vehicle status history" ON vehicle_status_history FOR INSERT
  WITH CHECK (vehicle_id IN (SELECT id FROM vehicles WHERE is_active_member(garage_id)));

CREATE POLICY "Garage members can update vehicle status history" ON vehicle_status_history FOR UPDATE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE is_active_member(garage_id)));

CREATE POLICY "Garage members can delete vehicle status history" ON vehicle_status_history FOR DELETE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE is_active_member(garage_id)));

-- ─── expenses (replace old policies) ────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;

CREATE POLICY "Garage members can view expenses" ON expenses FOR SELECT
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE is_active_member(garage_id)));

CREATE POLICY "Garage members can insert expenses" ON expenses FOR INSERT
  WITH CHECK (vehicle_id IN (SELECT id FROM vehicles WHERE is_active_member(garage_id)));

CREATE POLICY "Garage members can update expenses" ON expenses FOR UPDATE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE is_active_member(garage_id)));

CREATE POLICY "Garage members can delete expenses" ON expenses FOR DELETE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE is_active_member(garage_id)));

-- ─── media (replace old policies) ───────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own media" ON media;
DROP POLICY IF EXISTS "Users can insert own media" ON media;
DROP POLICY IF EXISTS "Users can update own media" ON media;
DROP POLICY IF EXISTS "Users can delete own media" ON media;

CREATE POLICY "Garage members can view media" ON media FOR SELECT
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE is_active_member(garage_id)));

CREATE POLICY "Garage members can insert media" ON media FOR INSERT
  WITH CHECK (vehicle_id IN (SELECT id FROM vehicles WHERE is_active_member(garage_id)));

CREATE POLICY "Garage members can update media" ON media FOR UPDATE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE is_active_member(garage_id)));

CREATE POLICY "Garage members can delete media" ON media FOR DELETE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE is_active_member(garage_id)));

-- ─── sales (replace old policies) ───────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own sales" ON sales;
DROP POLICY IF EXISTS "Users can insert own sales" ON sales;
DROP POLICY IF EXISTS "Users can update own sales" ON sales;
DROP POLICY IF EXISTS "Users can delete own sales" ON sales;

CREATE POLICY "Garage members can view sales" ON sales FOR SELECT
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE is_active_member(garage_id)));

CREATE POLICY "Garage members can insert sales" ON sales FOR INSERT
  WITH CHECK (vehicle_id IN (SELECT id FROM vehicles WHERE is_active_member(garage_id)));

CREATE POLICY "Garage members can update sales" ON sales FOR UPDATE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE is_active_member(garage_id)));

CREATE POLICY "Garage members can delete sales" ON sales FOR DELETE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE is_active_member(garage_id)));

-- ─── Storage policies (replace old ones) ────────────────────────────────
-- Path convention changes: {user_id}/... → {garage_id}/...

DROP POLICY IF EXISTS "Users can upload vehicle photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own vehicle photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own vehicle photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload vehicle documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own vehicle documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own vehicle documents" ON storage.objects;

CREATE POLICY "Garage members can upload vehicle photos" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vehicle-photos'
    AND auth.uid() IS NOT NULL
    AND is_active_member((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "Garage members can view vehicle photos" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'vehicle-photos'
    AND is_active_member((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "Garage members can delete vehicle photos" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vehicle-photos'
    AND is_active_member((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "Garage members can upload vehicle documents" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vehicle-documents'
    AND auth.uid() IS NOT NULL
    AND is_active_member((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "Garage members can view vehicle documents" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'vehicle-documents'
    AND is_active_member((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "Garage members can delete vehicle documents" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vehicle-documents'
    AND is_active_member((storage.foldername(name))[1]::uuid)
  );
