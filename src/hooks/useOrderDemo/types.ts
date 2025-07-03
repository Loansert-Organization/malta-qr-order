
export interface MenuItem {
  id: string;
  menu_id: string;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  category?: string | null;
  subcategory?: string | null;
  popular: boolean;
  featured: boolean;
  prep_time?: string | null;
  available: boolean;
  is_vegetarian?: boolean;
  allergens?: string[];
  created_at: string;
  updated_at: string;
  bar_id?: string | null;
}

export interface CartItem {
  id: string;
  menu_item_id: string;
  menu_item?: MenuItem;
  quantity: number;
  unit_price: number;
  total_price: number;
  modifiers?: CartItemModifier[];
  customizations?: Record<string, unknown>;
  special_requests?: string;
  added_at: string;
}

export interface CartItemModifier {
  modifier_id: string;
  name: string;
  price: number;
  selected: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  location?: string | null;
  logo_url?: string | null;
  active: boolean;
}
