-- Hybrid access & heirloom vault storage (additive migration)

create table if not exists public.vaults (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pinned_letter_ids uuid[] not null default '{}'::uuid[]
);

alter table public.vaults enable row level security;

drop policy if exists "vaults_own_row" on public.vaults;
create policy "vaults_own_row" on public.vaults
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.letters add column if not exists sender_id uuid references auth.users(id) on delete set null;
alter table public.letters add column if not exists content jsonb;
alter table public.letters add column if not exists metadata jsonb;
alter table public.letters add column if not exists access_key_hash text;
alter table public.letters add column if not exists is_claimed boolean not null default false;

alter table public.letters alter column recipient_id drop not null;

-- Existing rows may have legacy/invalid enum text (e.g. "lavender"). Any UPDATE
-- re-validates CHECK constraints—clear invalid values before backfilling sender_id.
update public.letters
set flower_type = null
where flower_type is not null
  and flower_type not in (
    'red_1','red_2','red_3','red_4',
    'purple_1','purple_2','purple_3','purple_4',
    'purple2_1','purple2_2','purple2_3','purple2_4',
    'orange_1','orange_2','orange_3','orange_4',
    'yellow_1','yellow_2','yellow_3',
    'white_1','white_2','white_3','white_4',
    'hasegawa_1','hasegawa_2','hasegawa_3','hasegawa_4'
  );

update public.letters
set stamp_type = null
where stamp_type is not null
  and stamp_type not in (
    'cherry_blossom','butterfly','moon','star','dove','letter','rose','sun'
  );

update public.letters set sender_id = author_id where sender_id is null;

create index if not exists letters_sender_id_idx on public.letters(sender_id);
create index if not exists letters_ready_link_idx on public.letters(access_key_hash)
  where access_key_hash is not null;

drop policy if exists "recipient_claim_update" on public.letters;
create policy "recipient_claim_update" on public.letters
  for update to authenticated
  using (
    recipient_id is null
    and coalesce(is_claimed, false) = false
    and access_key_hash is not null
  )
  with check (
    recipient_id = auth.uid()
    and is_claimed = true
  );
