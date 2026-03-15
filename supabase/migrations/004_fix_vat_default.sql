-- ─── Migration 004 : Fix default VAT rate to Belgian 21% ────────────────────
-- The initial schema used 20% (French rate). Belgium uses 21%.

ALTER TABLE expenses
  ALTER COLUMN vat_rate SET DEFAULT 21.00;
