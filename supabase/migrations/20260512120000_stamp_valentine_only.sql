-- Valentine-only postage stamps. Legacy landmark stamp ids no longer exist in the app.
update public.letters
set stamp_type = null
where stamp_type is not null
  and stamp_type not in (
    'valentine_1',
    'valentine_2',
    'valentine_3',
    'valentine_4'
  );
