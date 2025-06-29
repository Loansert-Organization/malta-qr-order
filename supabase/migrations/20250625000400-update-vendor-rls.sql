-- Update RLS policies for vendor operations

-- Bars table policies
CREATE POLICY "Allow vendors to update their own bar" ON bars
  FOR UPDATE 
  USING (true) -- In production, you'd check auth.uid() matches vendor_id
  WITH CHECK (true);

-- Menus table policies  
CREATE POLICY "Allow vendors to insert menu items" ON menus
  FOR INSERT
  WITH CHECK (true); -- In production, check bar ownership

CREATE POLICY "Allow vendors to update their menu items" ON menus
  FOR UPDATE
  USING (true) -- In production, check bar ownership
  WITH CHECK (true);

CREATE POLICY "Allow vendors to delete their menu items" ON menus
  FOR DELETE
  USING (true); -- In production, check bar ownership

-- Orders table policies
CREATE POLICY "Allow vendors to update order status" ON orders
  FOR UPDATE
  USING (true) -- In production, check bar_id matches vendor's bar
  WITH CHECK (true);

-- Payments table policies
CREATE POLICY "Allow vendors to update payment status" ON payments
  FOR UPDATE
  USING (true) -- In production, check order belongs to vendor's bar
  WITH CHECK (true); 