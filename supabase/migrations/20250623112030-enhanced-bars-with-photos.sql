
-- Add missing columns to bars table for comprehensive establishment data
ALTER TABLE public.bars 
ADD COLUMN IF NOT EXISTS photo_urls text[],
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS data_quality_score integer DEFAULT 100;

-- Update the data validation trigger to handle new fields
CREATE OR REPLACE FUNCTION validate_bar_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate that name is not empty
  IF NEW.name IS NULL OR trim(NEW.name) = '' THEN
    RAISE EXCEPTION 'Bar name cannot be empty';
  END IF;
  
  -- Validate rating range
  IF NEW.rating IS NOT NULL AND (NEW.rating < 0 OR NEW.rating > 5) THEN
    RAISE EXCEPTION 'Rating must be between 0 and 5';
  END IF;
  
  -- Validate review count
  IF NEW.review_count IS NOT NULL AND NEW.review_count < 0 THEN
    RAISE EXCEPTION 'Review count cannot be negative';
  END IF;
  
  -- Calculate and set data quality score
  NEW.data_quality_score := (
    CASE WHEN NEW.name IS NOT NULL AND trim(NEW.name) != '' THEN 20 ELSE 0 END +
    CASE WHEN NEW.address IS NOT NULL AND trim(NEW.address) != '' THEN 20 ELSE 0 END +
    CASE WHEN NEW.contact_number IS NOT NULL AND trim(NEW.contact_number) != '' THEN 15 ELSE 0 END +
    CASE WHEN NEW.rating IS NOT NULL THEN 15 ELSE 0 END +
    CASE WHEN NEW.review_count IS NOT NULL AND NEW.review_count > 0 THEN 15 ELSE 0 END +
    CASE WHEN NEW.location_gps IS NOT NULL THEN 15 ELSE 0 END
  );
  
  -- Update the updated_at timestamp
  NEW.updated_at = timezone('utc'::text, now());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_bars_photo_urls ON public.bars USING GIN (photo_urls);
CREATE INDEX IF NOT EXISTS idx_bars_data_quality ON public.bars (data_quality_score DESC);

-- Update the scheduled job configuration for more frequent updates
UPDATE public.scheduled_jobs 
SET config = jsonb_set(
  config, 
  '{frequency}', 
  '"weekly"'::jsonb
)
WHERE job_name = 'fetch-malta-bars';
