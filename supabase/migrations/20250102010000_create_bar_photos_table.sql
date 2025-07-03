-- Create bar_photos table for storing multiple photos per bar
CREATE TABLE IF NOT EXISTS bar_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bar_id UUID NOT NULL REFERENCES bars(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  supabase_url TEXT,
  enhanced_url TEXT,
  photo_reference TEXT,
  width INTEGER,
  height INTEGER,
  is_enhanced BOOLEAN DEFAULT false,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bar_photos_bar_id ON bar_photos(bar_id);
CREATE INDEX IF NOT EXISTS idx_bar_photos_status ON bar_photos(processing_status);

-- Enable RLS
ALTER TABLE bar_photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Allow public access to bar_photos" ON bar_photos FOR ALL USING (true); 