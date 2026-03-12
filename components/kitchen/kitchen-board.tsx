"use client";

import { useMemo, useTransition } from "react";
import { toast } from "sonner";

import { updateKitchenItemStatus } from "@/lib/actions/order";
import { StatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { minutesAgo } from "@/lib/utils";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

export interface KitchenItem {
  id: string;
  order_id: string;
  quantity: number;
  status: "submitted" | "preparing" | "ready";
  note: string | null;
  modifier_summary: string | null;
  sent_to_kitchen_at: string | null;
  menu_items: { name: string; prep_station: string | null } | null;
  orders:
    | {
        order_number: number;
        floor_table: { table_code: string } | null;
        waiter: { full_name: string } | null;
      }
    | Array<{
        order_number: number;
        floor_table: { table_code: string } | null;
        waiter: { full_name: string } | null;
      }>
    | null;
}

export function KitchenBoard({ restaurantId, items }: { restaurantId: string; items: KitchenItem[] }) {
  const [isPending, startTransition] = useTransition();

  useRealtimeRefresh({
    restaurantId,
    tables: ["order_items", "orders", "floor_tables"]
  });

  const grouped = useMemo(() => {
    const map = new Map<string, KitchenItem[]>();

    items.forEach((item) => {
      const list = map.get(item.order_id) ?? [];
      list.push(item);
      map.set(item.order_id, list);
    });

    return Array.from(map.entries()).map(([orderId, orderItems]) => {
      const first = orderItems[0];
      const orderMeta = Array.isArray(first.orders) ? first.orders[0] : first.orders;
      const oldest = orderItems
        .map((item) => item.sent_to_kitchen_at)
        .filter(Boolean)
        .sort()[0];

      return {
        orderId,
        orderNumber: orderMeta?.order_number ?? 0,
        tableCode: orderMeta?.floor_table?.table_code ?? "?",
        waiterName: orderMeta?.waiter?.full_name ?? "-",
        oldest,
        items: orderItems
      };
    });
  }, [items]);

  function moveTo(orderItemId: string, status: "preparing" | "ready" | "served") {
    startTransition(async () => {
      const result = await updateKitchenItemStatus({ orderItemId, status });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`Updated to ${status}`);
    });
  }

  return (
    <div className="stagger-list grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {grouped.map((ticket) => {
        const overdue = ticket.oldest
          ? Date.now() - new Date(ticket.oldest).getTime() > 1000 * 60 * 20
          : false;

        return (
          <Card
            key={ticket.orderId}
            className={`interactive-elevate ${overdue ? "kitchen-overdue border-rose-300" : ""}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-[#1f2d43]">Order #{ticket.orderNumber}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Table {ticket.tableCode} · Waiter {ticket.waiterName}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{minutesAgo(ticket.oldest ?? null)}</p>
                  {overdue ? <p className="font-semibold text-rose-600">Overdue</p> : null}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              {ticket.items.map((item) => (
                <div key={item.id} className="interactive-elevate rounded-xl border border-[#e4d8c5] bg-white/90 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {item.quantity}x {item.menu_items?.name ?? "Item"}
                      </p>
                      {item.modifier_summary ? (
                        <p className="text-xs text-muted-foreground">{item.modifier_summary}</p>
                      ) : null}
                      {item.note ? <p className="text-xs italic text-muted-foreground">{item.note}</p> : null}
                    </div>
                    <StatusPill status={item.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.status === "submitted" ? (
                      <Button
                        size="sm"
                        onClick={() => moveTo(item.id, "preparing")}
                        disabled={isPending}
                      >
                        Start Prep
                      </Button>
                    ) : null}
                    {item.status === "preparing" ? (
                      <Button
                        size="sm"
                        onClick={() => moveTo(item.id, "ready")}
                        disabled={isPending}
                      >
                        Mark Ready
                      </Button>
                    ) : null}
                    {item.status === "ready" ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => moveTo(item.id, "served")}
                        disabled={isPending}
                      >
                        Complete
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
