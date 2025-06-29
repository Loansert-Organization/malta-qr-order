-- Create bars table with full schema for ICUPA
CREATE TABLE IF NOT EXISTS bars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location GEOGRAPHY(POINT) NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  country TEXT NOT NULL CHECK (country IN ('Malta', 'Rwanda')),
  google_rating DECIMAL(2, 1) CHECK (google_rating >= 0 AND google_rating <= 5),
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  momo_code TEXT, -- For Rwanda payments
  revolut_link TEXT, -- For Malta payments
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for geographic queries
CREATE INDEX idx_bars_location ON bars USING GIST (location);
CREATE INDEX idx_bars_country ON bars (country);
CREATE INDEX idx_bars_active ON bars (is_active);

-- Enable RLS
ALTER TABLE bars ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to active bars
CREATE POLICY "Allow anonymous read access to active bars" ON bars
  FOR SELECT
  USING (is_active = true);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_bars_updated_at BEFORE UPDATE ON bars
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert sample data for testing
INSERT INTO bars (name, location, lat, lng, country, google_rating, logo_url, momo_code, revolut_link) VALUES
-- Malta bars
('The Thirsty Barber', ST_GeogFromText('POINT(14.5076 35.8989)'), 35.8989, 14.5076, 'Malta', 4.5, null, null, 'https://revolut.me/thirstybarber'),
('Bridge Bar', ST_GeogFromText('POINT(14.5140 35.8950)'), 35.8950, 14.5140, 'Malta', 4.3, null, null, 'https://revolut.me/bridgebar'),
('Hole in the Wall', ST_GeogFromText('POINT(14.4536 35.9019)'), 35.9019, 14.4536, 'Malta', 4.7, null, null, 'https://revolut.me/holeinwall'),
('Yard 32', ST_GeogFromText('POINT(14.5080 35.8960)'), 35.8960, 14.5080, 'Malta', 4.4, null, null, 'https://revolut.me/yard32'),
('Cafe Society', ST_GeogFromText('POINT(14.5133 35.8985)'), 35.8985, 14.5133, 'Malta', 4.2, null, null, 'https://revolut.me/cafesociety'),

-- Rwanda bars  
('Sundowner', ST_GeogFromText('POINT(30.0619 -1.9441)'), -1.9441, 30.0619, 'Rwanda', 4.6, null, '182*1*1001', null),
('Choma\'d', ST_GeogFromText('POINT(30.0644 -1.9563)'), -1.9563, 30.0644, 'Rwanda', 4.5, null, '182*1*1002', null),
('Pili Pili', ST_GeogFromText('POINT(30.0588 -1.9398)'), -1.9398, 30.0588, 'Rwanda', 4.4, null, '182*1*1003', null),
('K-Club', ST_GeogFromText('POINT(30.0604 -1.9507)'), -1.9507, 30.0604, 'Rwanda', 4.3, null, '182*1*1004', null),
('Papyrus', ST_GeogFromText('POINT(30.0822 -1.9536)'), -1.9536, 30.0822, 'Rwanda', 4.5, null, '182*1*1005', null); 