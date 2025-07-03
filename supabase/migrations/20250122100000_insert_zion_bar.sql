-- Insert Zion Bar & Restaurant (Malta) into the bars table

INSERT INTO public.bars (
  name,
  address,
  google_place_id,
  country,
  is_active,
  created_at,
  updated_at
) VALUES (
  'Zion Bar & Restaurant',
  'St Thomas Bay, Marsaskala, Malta',
  '0x130e5b7da8ed0c95:0xd732a6cfa8526a23',
  'Malta',
  TRUE,
  timezone('utc', now()),
  timezone('utc', now())
); 