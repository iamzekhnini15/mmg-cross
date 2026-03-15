-- ─── Migration 003 : Comptabilité / TVA ──────────────────────────────────────
-- Adds:
--   1. vat_regime       column on vehicles  ('margin' | 'normal')
--   2. seller_vat_number column on vehicles (n° TVA when seller is professional)
--   3. quarterly_reports table (quarterly VAT declaration status per garage)

-- 1. Enrichir la table vehicles pour le régime TVA
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS vat_regime       TEXT NOT NULL DEFAULT 'margin'
    CHECK (vat_regime IN ('margin', 'normal')),
  ADD COLUMN IF NOT EXISTS seller_vat_number TEXT;

-- Backfill: derive vat_regime from existing seller_type data
UPDATE vehicles
SET vat_regime = CASE WHEN seller_type = 'professional' THEN 'normal' ELSE 'margin' END;

-- 2. Rapport trimestriel
CREATE TABLE IF NOT EXISTS quarterly_reports (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id    UUID        NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  year         INT         NOT NULL CHECK (year >= 2000 AND year <= 2100),
  quarter      SMALLINT    NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  status       TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  submitted_at TIMESTAMPTZ,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (garage_id, year, quarter)
);

-- Updated_at trigger for quarterly_reports
CREATE OR REPLACE FUNCTION update_quarterly_reports_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_quarterly_reports_updated_at ON quarterly_reports;
CREATE TRIGGER trg_quarterly_reports_updated_at
  BEFORE UPDATE ON quarterly_reports
  FOR EACH ROW EXECUTE FUNCTION update_quarterly_reports_updated_at();

-- 3. RLS policies for quarterly_reports
ALTER TABLE quarterly_reports ENABLE ROW LEVEL SECURITY;

-- Members can view reports for their garage
CREATE POLICY "quarterly_reports_select"
  ON quarterly_reports FOR SELECT
  USING (is_active_member(garage_id));

-- Members can insert (create draft)
CREATE POLICY "quarterly_reports_insert"
  ON quarterly_reports FOR INSERT
  WITH CHECK (is_active_member(garage_id));

-- Admins and owners can update (mark as submitted)
CREATE POLICY "quarterly_reports_update"
  ON quarterly_reports FOR UPDATE
  USING (is_garage_admin(garage_id));

-- Admins and owners can delete
CREATE POLICY "quarterly_reports_delete"
  ON quarterly_reports FOR DELETE
  USING (is_garage_admin(garage_id));
