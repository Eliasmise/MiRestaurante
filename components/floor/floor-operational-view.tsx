"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Focus, Layers } from "lucide-react";

import { StatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import { cn } from "@/lib/utils";
import type { FloorTable, TableStatus, UserRole } from "@/lib/types";

const statusClass: Record<string, string> = {
  available: "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-300",
  occupied: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300",
  ordering: "bg-gradient-to-br from-sky-50 to-sky-100 border-sky-300",
  sent_to_kitchen: "bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-300",
  in_preparation: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300",
  ready: "bg-gradient-to-br from-teal-100 to-emerald-100 border-teal-400",
  needs_payment: "animate-pulseRing bg-gradient-to-br from-rose-50 to-rose-100 border-rose-400",
  closed: "bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300"
};

interface FloorOperationalViewProps {
  restaurantId: string;
  userId: string;
  role: UserRole;
  floors: Array<{ id: string; name: string; width: number; height: number }>;
  tables: FloorTable[];
}

export function FloorOperationalView({
  restaurantId,
  userId,
  role,
  floors,
  tables
}: FloorOperationalViewProps) {
  const router = useRouter();
  const [currentFloorId, setCurrentFloorId] = useState(floors[0]?.id ?? "");
  const [showMineOnly, setShowMineOnly] = useState(role === "waiter");

  useRealtimeRefresh({
    restaurantId,
    tables: ["floor_tables", "orders", "order_items"]
  });

  const currentFloor = floors.find((floor) => floor.id === currentFloorId) ?? floors[0];

  const visibleTables = useMemo(() => {
    return tables
      .filter((table) => table.floor_id === currentFloor?.id && table.is_active)
      .filter((table) => (showMineOnly ? table.assigned_waiter_id === userId : true));
  }, [currentFloor?.id, showMineOnly, tables, userId]);

  const byStatus = useMemo(() => {
    return visibleTables.reduce<Record<string, number>>((acc, table) => {
      acc[table.status] = (acc[table.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [visibleTables]);

  return (
    <div className="space-y-4">
      <Card className="interactive-elevate overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Live Floor Map
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                className="w-44"
                value={currentFloorId}
                onChange={(e) => setCurrentFloorId(e.target.value)}
              >
                {floors.map((floor) => (
                  <option key={floor.id} value={floor.id}>
                    {floor.name}
                  </option>
                ))}
              </Select>
              {(role === "waiter" || role === "manager") && (
                <Button
                  variant={showMineOnly ? "default" : "outline"}
                  onClick={() => setShowMineOnly((current) => !current)}
                >
                  <Focus className="h-4 w-4" />
                  {showMineOnly ? "Showing My Tables" : "Show My Tables"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {[
              "available",
              "occupied",
              "ordering",
              "sent_to_kitchen",
              "in_preparation",
              "ready",
              "needs_payment"
            ].map((status) => (
              <StatusPill key={status} status={status as TableStatus} />
            ))}
            <span className="ml-auto rounded-full bg-[#f8efe0] px-3 py-1 text-xs font-semibold text-[#7b613a]">
              {visibleTables.length} visible tables
            </span>
          </div>

          <div className="stagger-list mb-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <div className="interactive-elevate rounded-xl border border-white/80 bg-white/70 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Available</p>
              <p className="mt-1 text-2xl font-semibold text-[#1f2d43]">{byStatus.available ?? 0}</p>
            </div>
            <div className="interactive-elevate rounded-xl border border-white/80 bg-white/70 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">In Service</p>
              <p className="mt-1 text-2xl font-semibold text-[#1f2d43]">
                {(byStatus.occupied ?? 0) + (byStatus.ordering ?? 0) + (byStatus.sent_to_kitchen ?? 0)}
              </p>
            </div>
            <div className="interactive-elevate rounded-xl border border-white/80 bg-white/70 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Kitchen Active</p>
              <p className="mt-1 text-2xl font-semibold text-[#1f2d43]">
                {(byStatus.in_preparation ?? 0) + (byStatus.ready ?? 0)}
              </p>
            </div>
            <div className="interactive-elevate rounded-xl border border-white/80 bg-white/70 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Needs Payment</p>
              <p className="mt-1 text-2xl font-semibold text-[#1f2d43]">{byStatus.needs_payment ?? 0}</p>
            </div>
          </div>

          <div
            className="floor-grid luxury-scroll relative w-full overflow-auto rounded-2xl border border-[#dbcdb5] bg-white/90"
            style={{
              minHeight: Math.max(620, currentFloor?.height ?? 620),
              maxHeight: "75vh"
            }}
          >
            <div
              className="relative"
              style={{
                width: Math.max(980, currentFloor?.width ?? 980),
                height: Math.max(620, currentFloor?.height ?? 620)
              }}
            >
              {visibleTables.map((table) => (
                <button
                  key={table.id}
                  className={cn(
                    "absolute flex flex-col items-center justify-center border-2 p-2 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-luxe",
                    statusClass[table.status] ?? "bg-white border-slate-200",
                    table.shape === "circle" && "rounded-full",
                    table.shape === "square" && "rounded-xl",
                    table.shape === "rectangle" && "rounded-xl"
                  )}
                  style={{
                    left: table.pos_x,
                    top: table.pos_y,
                    width: table.width,
                    height: table.height
                  }}
                  onClick={() => router.push(`/orders/${table.id}`)}
                >
                  <span className="text-base font-semibold text-[#1f2d43]">{table.table_code}</span>
                  <span className="line-clamp-1 text-xs text-slate-700">{table.display_name}</span>
                  <span className="text-[11px] text-slate-600">{table.assigned_waiter_name ?? "Unassigned"}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
