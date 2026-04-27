-- Drop the legacy CHECK constraints on `letters.flower_type` and
-- `letters.stamp_type`. They were originally intended as a safety net,
-- but they drifted out of sync with lib/constants.ts (FLOWER_TYPES /
-- STAMP_TYPES) — every time a new variant was added in code, sealing a
-- letter in production failed with:
--
--   ERROR 23514 "new row for relation \"letters\" violates check
--   constraint \"letters_flower_type_check\""
--
-- Application-level validation in lib/constants.ts is the source of
-- truth, so dropping the DB-side constraints removes the duplication
-- and stops it drifting again. Re-adding the constraints is unsafe on
-- existing data anyway (some rows may have legacy values that wouldn't
-- match a freshly-written constraint), which is exactly the
-- "violated by some row" error you'll hit if you try.
--
-- Idempotent: safe to run multiple times.

alter table public.letters
  drop constraint if exists letters_flower_type_check;

alter table public.letters
  drop constraint if exists letters_stamp_type_check;
