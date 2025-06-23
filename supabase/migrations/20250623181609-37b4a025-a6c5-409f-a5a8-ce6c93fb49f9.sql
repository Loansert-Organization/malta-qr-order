
-- Add order status tracking and notifications
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_ready_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS actual_ready_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE;

-- Create order status history table
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Create vendor notifications table
CREATE TABLE IF NOT EXISTS vendor_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment tracking table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'EUR',
  stripe_session_id TEXT,
  revolut_transaction_id TEXT,
  status TEXT DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_status_history
CREATE POLICY "order_status_history_select" ON order_status_history
  FOR SELECT USING (true);
CREATE POLICY "order_status_history_insert" ON order_status_history
  FOR INSERT WITH CHECK (true);

-- RLS policies for vendor_notifications
CREATE POLICY "vendor_notifications_select" ON vendor_notifications
  FOR SELECT USING (true);
CREATE POLICY "vendor_notifications_insert" ON vendor_notifications
  FOR INSERT WITH CHECK (true);
CREATE POLICY "vendor_notifications_update" ON vendor_notifications
  FOR UPDATE USING (true);

-- RLS policies for payments
CREATE POLICY "payments_select" ON payments
  FOR SELECT USING (true);
CREATE POLICY "payments_insert" ON payments
  FOR INSERT WITH CHECK (true);
CREATE POLICY "payments_update" ON payments
  FOR UPDATE USING (true);

-- Add realtime for order updates
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE order_status_history REPLICA IDENTITY FULL;
ALTER TABLE vendor_notifications REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_status_history;
ALTER PUBLICATION supabase_realtime ADD TABLE vendor_notifications;
