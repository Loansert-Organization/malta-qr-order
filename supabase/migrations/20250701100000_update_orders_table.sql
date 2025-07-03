-- Add customer information fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS table_number TEXT,
ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- Add index for customer phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);

-- Add index for table number
CREATE INDEX IF NOT EXISTS idx_orders_table_number ON orders(table_number);

-- Update RLS policies to allow inserts with new fields
DROP POLICY IF EXISTS "Allow authenticated users to create orders" ON orders;
CREATE POLICY "Allow authenticated users to create orders" ON orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to view their own orders" ON orders;
CREATE POLICY "Allow users to view their own orders" ON orders
  FOR SELECT USING (true); 