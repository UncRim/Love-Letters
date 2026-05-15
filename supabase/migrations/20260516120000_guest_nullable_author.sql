-- Guest composers: letters may be sealed without an authenticated author.
-- author_id is filled when the user signs up and runs sync from LocalStorage IDs.

alter table public.letters alter column author_id drop not null;
