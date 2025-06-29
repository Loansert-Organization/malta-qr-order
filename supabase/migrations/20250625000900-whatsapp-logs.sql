-- Log WhatsApp vendor bot interactions
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  direction TEXT CHECK (direction IN ('outgoing', 'incoming')),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  retries SMALLINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view whatsapp logs" ON whatsapp_logs FOR SELECT USING (is_admin()); 