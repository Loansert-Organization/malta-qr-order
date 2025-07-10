-- USERS ----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  role text DEFAULT 'customer',
  created_at timestamptz DEFAULT now()
);

-- BARS -----------------------------------------------------
CREATE TABLE IF NOT EXISTS bars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES users(id),
  name text NOT NULL,
  address text,
  created_at timestamptz DEFAULT now()
);

-- MENU ITEMS ----------------------------------------------
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bar_id uuid REFERENCES bars(id),
  name text NOT NULL,
  price numeric NOT NULL,
  currency text DEFAULT 'EUR',
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- ORDERS ---------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  bar_id  uuid REFERENCES bars(id),
  total numeric NOT NULL,
  currency text DEFAULT 'EUR',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- ORDER ITEMS ---------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  item_id  uuid REFERENCES menu_items(id),
  item_name text,
  quantity int,
  price numeric
);
