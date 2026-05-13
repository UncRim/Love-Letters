-- Heritage Valentine PNG library ids (Be My Valentine 02 + 03 packs).
update public.letters
set stamp_type = null
where stamp_type is not null
  and stamp_type not in (
    'valentine02_1',
    'valentine02_2',
    'valentine02_3',
    'valentine02_4',
    'valentine02_5',
    'valentine02_6',
    'valentine02_7',
    'valentine02_8',
    'valentine02_9',
    'valentine03_1',
    'valentine03_2',
    'valentine03_3',
    'valentine03_4',
    'valentine03_5',
    'valentine03_6',
    'valentine03_7',
    'valentine03_8'
  );
