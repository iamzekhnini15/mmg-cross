-- Migration 005: Add changed_by_email to vehicle_status_history
-- Allows tracking which user performed each status change

ALTER TABLE vehicle_status_history
  ADD COLUMN IF NOT EXISTS changed_by_email text;
