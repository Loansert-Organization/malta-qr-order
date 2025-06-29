-- Extend bars table for Google Maps import
ALTER TABLE bars
ADD COLUMN IF NOT EXISTS google_place_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS user_ratings_total INT,
ADD COLUMN IF NOT EXISTS photo_ref TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS tagline TEXT;

-- Create storage bucket for bar photos
select
  case when not exists (select 1 from storage.buckets where id = 'bar_photos')
  then
    storage.insert_bucket('bar_photos', false, 'authenticated')
  end; 