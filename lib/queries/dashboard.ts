import { subDays } from "date-fns";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardMetrics(restaurantId: string) {
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = subDays(todayStart, 6).toISOString();

  const [{ count: openOrdersCount }, { data: todaySales }, { data: tableSnapshot }, { data: weekSales }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId)
        .in("status", ["draft", "submitted", "in_preparation", "ready", "served"]),
      supabase
        .from("orders")
        .select("total")
        .eq("restaurant_id", restaurantId)
        .eq("status", "closed")
        .gte("closed_at", todayStart.toISOString()),
      supabase
        .from("floor_tables")
        .select("status")
        .eq("restaurant_id", restaurantId)
        .eq("is_active", true),
      supabase
        .from("orders")
        .select("closed_at, total")
        .eq("restaurant_id", restaurantId)
        .eq("status", "closed")
        .gte("closed_at", weekStart)
    ]);

  const totalToday = (todaySales ?? []).reduce((sum, row) => sum + Number(row.total), 0);

  const statusCounts = (tableSnapshot ?? []).reduce(
    (acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const salesByDayMap = new Map<string, number>();
  (weekSales ?? []).forEach((row) => {
    if (!row.closed_at) return;
    const key = row.closed_at.slice(0, 10);
    salesByDayMap.set(key, (salesByDayMap.get(key) ?? 0) + Number(row.total));
  });

  return {
    openOrders: openOrdersCount ?? 0,
    totalToday,
    statusCounts,
    salesByDay: Array.from(salesByDayMap.entries()).map(([date, total]) => ({ date, total }))
  };
}
