export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
  product_count?: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock_qty: number;
  image_url?: string;
  is_active: boolean;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'admin';
}

export interface OrderItem {
  product_id: number;
  quantity: number;
  unit_price?: number;
  name?: string;
  image_url?: string;
}

export interface Order {
  id: number;
  user_id: number;
  total: number;
  status: 'en_attente' | 'confirmee' | 'expediee' | 'livree' | 'annulee';
  address?: string;
  phone?: string;
  notes?: string;
  created_at: string;
  items?: OrderItem[];
  client_name?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
}

export interface OrderItemInput {
  product_id: number;
  quantity: number;
  color?: string | null;
  size?: string | null;
}
