-- Six handwriting styles; remap removed font ids to dancing_script.
update public.letters
set font_style = 'dancing_script'
where font_style in (
  'sacramento',
  'great_vibes',
  'parisienne'
);

alter table public.letters drop constraint if exists letters_font_style_check;

alter table public.letters add constraint letters_font_style_check check (
  font_style in (
    'loved_by_the_king',
    'lumanosimo',
    'long_cang',
    'love_ya_like_a_sister',
    'caveat',
    'dancing_script'
  )
);
