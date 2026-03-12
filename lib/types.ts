export type UserRole = "super_admin" | "manager" | "waiter" | "kitchen" | "cashier";

export type TableShape = "circle" | "square" | "rectangle";

export type TableStatus =
  | "available"
  | "occupied"
  | "ordering"
  | "sent_to_kitchen"
  | "in_preparation"
  | "ready"
  | "needs_payment"
  | "closed";

export type OrderStatus =
  | "draft"
  | "submitted"
  | "in_preparation"
  | "ready"
  | "served"
  | "closed"
  | "cancelled";

export type OrderItemStatus =
  | "draft"
  | "submitted"
  | "preparing"
  | "ready"
  | "served"
  | "voided";

export type PaymentMethod = "cash" | "card" | "transfer" | "other";

export interface UserContext {
  userId: string;
  restaurantId: string | null;
  role: UserRole;
  fullName: string;
  restaurantName: string | null;
  locale: "en" | "es";
}

export interface FloorTable {
  id: string;
  restaurant_id: string;
  floor_id: string;
  section_id: string | null;
  table_code: string;
  display_name: string;
  shape: TableShape;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  seats: number;
  is_active: boolean;
  status: TableStatus;
  assigned_waiter_id: string | null;
  assigned_waiter_name?: string | null;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
}

export interface MenuSubcategory {
  id: string;
  category_id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  subcategory_id: string | null;
  prep_station: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  tax_rate: number;
  sort_order: number;
  is_active: boolean;
}

export interface Order {
  id: string;
  restaurant_id: string;
  floor_table_id: string;
  waiter_id: string;
  order_number: number;
  status: OrderStatus;
  opened_at: string;
  submitted_at: string | null;
  closed_at: string | null;
  subtotal: number;
  tax_total: number;
  service_charge_total: number;
  discount_total: number;
  total: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  item_total: number;
  status: OrderItemStatus;
  note: string | null;
  modifier_summary: string | null;
  sent_to_kitchen_at: string | null;
  kitchen_started_at: string | null;
  ready_at: string | null;
  served_at: string | null;
  voided_at: string | null;
}

export interface StaffMember {
  user_id: string;
  role: UserRole;
  full_name: string;
  email: string;
  active: boolean;
}
