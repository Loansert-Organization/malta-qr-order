-- Add missing columns to bars table for proper AdminBars functionality
ALTER TABLE public.bars 
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Malta',
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS momo_code TEXT,
ADD COLUMN IF NOT EXISTS revolut_link TEXT,
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';

-- Update existing bars to have default country if null
UPDATE public.bars 
SET country = 'Malta' 
WHERE country IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_bars_country ON public.bars(country);
CREATE INDEX IF NOT EXISTS idx_bars_is_active ON public.bars(is_active);