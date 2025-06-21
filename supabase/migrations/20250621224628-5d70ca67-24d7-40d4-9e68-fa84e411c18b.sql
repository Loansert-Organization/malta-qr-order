
-- Add customer information fields to orders table
ALTER TABLE orders 
ADD COLUMN customer_name TEXT,
ADD COLUMN customer_phone TEXT,
ADD COLUMN customer_email TEXT,
ADD COLUMN notes TEXT;
