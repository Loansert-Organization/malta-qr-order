
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  subcategory?: string;
  popular?: boolean;
  prep_time?: string;
  available?: boolean;
  is_vegetarian?: boolean;
  allergens?: string[];
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  description?: string;
  location?: string;
  logo_url?: string;
  active: boolean;
}
