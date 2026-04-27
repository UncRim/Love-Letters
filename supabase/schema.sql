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
                     check (stamp_type in ('cherry_blossom','butterfly','moon','sparrow','none')),
  flower_type      text
                     check (flower_type in ('tulip','lavender','rose','daisy','forget_me_not','none')),

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
