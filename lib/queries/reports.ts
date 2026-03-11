import { createClient } from "@/lib/supabase/server";

interface ReportFilters {
  restaurantId: string;
  from?: string;
  to?: string;
  waiterId?: string;
  paymentMethod?: string;
}

export async function getReportsData(filters: ReportFilters) {
  const supabase = await createClient();
  const from = filters.from ?? new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();
  const to = filters.to ?? new Date().toISOString();

  let ordersQuery = supabase
    .from("orders")
    .select("id, total, closed_at, waiter_id")
    .eq("restaurant_id", filters.restaurantId)
    .eq("status", "closed")
    .gte("closed_at", from)
    .lte("closed_at", to);

  if (filters.waiterId) {
    ordersQuery = ordersQuery.eq("waiter_id", filters.waiterId);
  }

  const { data: orders } = await ordersQuery;

  let paymentQuery = supabase
    .from("payments")
    .select("amount, payment_method, paid_at")
    .eq("restaurant_id", filters.restaurantId)
    .gte("paid_at", from)
    .lte("paid_at", to);

  if (filters.paymentMethod) {
    paymentQuery = paymentQuery.eq("payment_method", filters.paymentMethod);
  }

  const [{ data: payments }, { data: itemRows }, { data: waiters }, { data: categories }] = await Promise.all([
    paymentQuery,
    supabase
      .from("order_items")
      .select("quantity, item_total, orders!inner(closed_at, status), menu_items(name, category_id)")
      .eq("restaurant_id", filters.restaurantId)
      .eq("orders.status", "closed")
      .gte("orders.closed_at", from)
      .lte("orders.closed_at", to),
    supabase
      .from("restaurant_users")
      .select("user_id, full_name")
      .eq("restaurant_id", filters.restaurantId)
      .eq("active", true),
    supabase
      .from("menu_categories")
      .select("id, name")
      .eq("restaurant_id", filters.restaurantId)
  ]);

  const ordersSafe = orders ?? [];
  const paymentsSafe = payments ?? [];
  const itemsSafe = itemRows ?? [];

  const totalSales = paymentsSafe.reduce((sum, row) => sum + Number(row.amount), 0);
  const ordersCount = ordersSafe.length;
  const averageTicket = ordersCount === 0 ? 0 : totalSales / ordersCount;

  const salesByDay = new Map<string, number>();
  ordersSafe.forEach((order) => {
    if (!order.closed_at) return;
    const key = order.closed_at.slice(0, 10);
    salesByDay.set(key, (salesByDay.get(key) ?? 0) + Number(order.total));
  });

  const salesByHour = new Map<string, number>();
  ordersSafe.forEach((order) => {
    if (!order.closed_at) return;
    const d = new Date(order.closed_at);
    const key = `${d.getHours().toString().padStart(2, "0")}:00`;
    salesByHour.set(key, (salesByHour.get(key) ?? 0) + Number(order.total));
  });

  const itemSales = new Map<string, { name: string; quantity: number; total: number }>();
  const categorySales = new Map<string, number>();
  const categoryMap = new Map((categories ?? []).map((category) => [category.id, category.name]));

  itemsSafe.forEach((row) => {
    const menuItem = Array.isArray(row.menu_items) ? row.menu_items[0] : row.menu_items;
    const itemName = menuItem?.name ?? "Unknown";
    const categoryName = menuItem?.category_id
      ? categoryMap.get(menuItem.category_id) ?? "Uncategorized"
      : "Uncategorized";
    const qty = Number(row.quantity);
    const total = Number(row.item_total);

    const current = itemSales.get(itemName) ?? { name: itemName, quantity: 0, total: 0 };
    current.quantity += qty;
    current.total += total;
    itemSales.set(itemName, current);

    categorySales.set(categoryName, (categorySales.get(categoryName) ?? 0) + total);
  });

  const waiterMap = new Map((waiters ?? []).map((w) => [w.user_id, w.full_name]));
  const salesByWaiter = new Map<string, number>();
  ordersSafe.forEach((order) => {
    const waiterName = waiterMap.get(order.waiter_id) ?? "Unknown";
    salesByWaiter.set(waiterName, (salesByWaiter.get(waiterName) ?? 0) + Number(order.total));
  });

  return {
    totalSales,
    ordersCount,
    averageTicket,
    salesByDay: Array.from(salesByDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date, total })),
    salesByHour: Array.from(salesByHour.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, total]) => ({ hour, total })),
    itemSales: Array.from(itemSales.values()).sort((a, b) => b.total - a.total),
    categorySales: Array.from(categorySales.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total),
    salesByWaiter: Array.from(salesByWaiter.entries())
      .map(([waiter, total]) => ({ waiter, total }))
      .sort((a, b) => b.total - a.total),
    closedOrders: ordersSafe
      .filter((o) => o.closed_at)
      .map((o) => ({
        id: o.id,
        closed_at: o.closed_at,
        total: Number(o.total),
        waiter: waiterMap.get(o.waiter_id) ?? "Unknown"
      }))
      .sort((a, b) => (a.closed_at < b.closed_at ? 1 : -1))
  };
}
