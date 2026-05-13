-- Enable UUID extension
create extension if not exists "pgcrypto";

create table public.letters (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  delivered_at     timestamptz,
  author_id        uuid not null references auth.users(id) on delete cascade,
  recipient_id     uuid not null references auth.users(id) on delete cascade,

  -- Content
  title            text,
  body             text not null,

  -- Stationery metadata
  font_style       text not null default 'dancing_script'
                     check (font_style in ('dancing_script','caveat','sacramento')),
  color_theme      text not null default 'vintage'
                     check (color_theme in ('vintage','rose','midnight')),

  -- Delivery metadata
  stamp_type       text
                     check (stamp_type is null or stamp_type in (
                       'valentine02_1','valentine02_2','valentine02_3','valentine02_4','valentine02_5',
                       'valentine02_6','valentine02_7','valentine02_8','valentine02_9',
                       'valentine03_1','valentine03_2','valentine03_3','valentine03_4','valentine03_5',
                       'valentine03_6','valentine03_7','valentine03_8'
                     )),
  flower_type      text
                     check (flower_type in (
                       'red_1','red_2','red_3','red_4',
                       'purple_1','purple_2','purple_3','purple_4',
                       'purple2_1','purple2_2','purple2_3','purple2_4',
                       'orange_1','orange_2','orange_3','orange_4',
                       'yellow_1','yellow_2','yellow_3',
                       'white_1','white_2','white_3','white_4',
                       'hasegawa_1','hasegawa_2','hasegawa_3','hasegawa_4'
                     )),

  -- State
  is_draft         boolean not null default true,
  is_opened        boolean not null default false,
  opened_at        timestamptz
);

-- Row Level Security
alter table public.letters enable row level security;

-- Recipient can read their delivered, non-draft letters
create policy "recipient_read" on public.letters
  for select using (
    auth.uid() = recipient_id
    and is_draft = false
    and (delivered_at is null or delivered_at <= now())
  );

-- Author has full write access to their own letters
create policy "author_write" on public.letters
  for all using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- Index for vault query performance
create index letters_recipient_idx on public.letters(recipient_id, delivered_at);
