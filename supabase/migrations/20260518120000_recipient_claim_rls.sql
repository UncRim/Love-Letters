-- When a recipient archives a share-link letter, stamp the time (UI "New" badge).
alter table public.letters
  add column if not exists recipient_claimed_at timestamptz;

-- Backfill for already-claimed rows
update public.letters
set recipient_claimed_at = coalesce(opened_at, delivered_at, created_at)
where recipient_id is not null
  and coalesce(is_claimed, false) = true
  and recipient_claimed_at is null;

-- Claims are performed via POST /api/letters/[id]/claim (verifies secret + service role).
-- Remove the permissive policy that allowed any authenticated user to claim by id without proof.
drop policy if exists "recipient_claim_update" on public.letters;
