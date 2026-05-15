-- Allow Great Vibes and Parisienne handwriting on letters (5 fonts total).
alter table public.letters drop constraint if exists letters_font_style_check;

alter table public.letters add constraint letters_font_style_check check (
  font_style in (
    'dancing_script',
    'caveat',
    'sacramento',
    'great_vibes',
    'parisienne'
  )
);
