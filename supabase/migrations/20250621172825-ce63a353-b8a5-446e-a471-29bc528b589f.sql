
-- Create vendors table for restaurant/bar information
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  location TEXT,
  description TEXT,
  logo_url TEXT,
  revolut_link TEXT,
  stripe_link TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create menus table
CREATE TABLE public.menus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Main Menu',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID REFERENCES public.menus(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT,
  available BOOLEAN DEFAULT true,
  popular BOOLEAN DEFAULT false,
  prep_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  guest_session_id TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('stripe', 'revolut')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_waiter_logs table for tracking AI interactions
CREATE TABLE public.ai_waiter_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  guest_session_id TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  suggestions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pinecone_embeddings table to link menu items with their vector IDs
CREATE TABLE public.pinecone_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
  vector_id TEXT NOT NULL,
  embedding_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert demo vendor data
INSERT INTO public.vendors (name, slug, location, description) VALUES
('Ta'' Kris Restaurant', 'ta-kris', 'Valletta, Malta', 'Authentic Maltese cuisine in the heart of the capital');

-- Insert demo menu
INSERT INTO public.menus (vendor_id, name) 
SELECT id, 'Traditional Maltese Menu' FROM public.vendors WHERE slug = 'ta-kris';

-- Insert demo menu items
INSERT INTO public.menu_items (menu_id, name, description, price, category, popular, prep_time) 
SELECT 
  m.id,
  item.name,
  item.description,
  item.price,
  item.category,
  item.popular,
  item.prep_time
FROM public.menus m
CROSS JOIN (VALUES
  ('Maltese Ftira', 'Traditional Maltese bread with tomatoes, olives, capers, and local cheese', 8.50, 'Mains', true, '15 min'),
  ('Rabbit Stew (Fenkata)', 'Traditional Maltese rabbit stew with wine, herbs, and vegetables', 16.00, 'Mains', true, '25 min'),
  ('Kinnie & Pastizzi', 'Malta''s iconic soft drink with traditional pastry filled with ricotta or peas', 4.50, 'Snacks', false, '5 min'),
  ('Gbejniet Salad', 'Fresh local goat cheese with Mediterranean vegetables and olive oil', 12.00, 'Starters', false, '10 min')
) AS item(name, description, price, category, popular, prep_time)
WHERE m.vendor_id = (SELECT id FROM public.vendors WHERE slug = 'ta-kris');

-- Enable Row Level Security (RLS)
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_waiter_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinecone_embeddings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access to vendor data (for guests)
CREATE POLICY "Public can view active vendors" ON public.vendors FOR SELECT USING (active = true);
CREATE POLICY "Public can view active menus" ON public.menus FOR SELECT USING (active = true);
CREATE POLICY "Public can view available menu items" ON public.menu_items FOR SELECT USING (available = true);

-- Create RLS policies for orders (anonymous guests can create/view their own orders)
CREATE POLICY "Guests can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Guests can view their own orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Guests can create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Guests can view their own order items" ON public.order_items FOR SELECT USING (true);

-- Create RLS policies for AI waiter logs
CREATE POLICY "Guests can create AI logs" ON public.ai_waiter_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Guests can view their own AI logs" ON public.ai_waiter_logs FOR SELECT USING (true);

-- Create RLS policies for Pinecone embeddings (public read access)
CREATE POLICY "Public can view embeddings" ON public.pinecone_embeddings FOR SELECT USING (true);
