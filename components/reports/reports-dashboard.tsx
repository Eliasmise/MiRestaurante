"use client";

import { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";
import { StatCard } from "@/components/shared/stat-card";
import { l, type Locale } from "@/lib/i18n";

type ClosedOrder = {
  id: string;
  closed_at: string;
  total: number;
  waiter: string;
};

const columnHelper = createColumnHelper<ClosedOrder>();

export function ReportsDashboard({
  locale,
  totalSales,
  ordersCount,
  averageTicket,
  salesByDay,
  salesByHour,
  itemSales,
  categorySales,
  salesByWaiter,
  closedOrders
}: {
  locale: Locale;
  totalSales: number;
  ordersCount: number;
  averageTicket: number;
  salesByDay: Array<{ date: string; total: number }>;
  salesByHour: Array<{ hour: string; total: number }>;
  itemSales: Array<{ name: string; quantity: number; total: number }>;
  categorySales: Array<{ category: string; total: number }>;
  salesByWaiter: Array<{ waiter: string; total: number }>;
  closedOrders: ClosedOrder[];
}) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("closed_at", {
        header: l(locale, "Closed At", "Cerrado el"),
        cell: (info) => new Date(info.getValue()).toLocaleString(locale === "es" ? "es-HN" : "en-US")
      }),
      columnHelper.accessor("waiter", {
        header: l(locale, "Waiter", "Mesero")
      }),
      columnHelper.accessor("total", {
        header: l(locale, "Total", "Total"),
        cell: (info) => formatMoney(info.getValue())
      })
    ],
    [locale]
  );

  const table = useReactTable({
    data: closedOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label={l(locale, "Total Sales", "Ventas totales")}
          value={formatMoney(totalSales)}
          hint={l(locale, "Selected range", "Rango seleccionado")}
        />
        <StatCard label={l(locale, "Orders", "Pedidos")} value={`${ordersCount}`} />
        <StatCard label={l(locale, "Avg Ticket", "Ticket promedio")} value={formatMoney(averageTicket)} />
      </div>

      <div className="stagger-list grid gap-4 xl:grid-cols-2">
        <Card className="interactive-elevate overflow-hidden">
          <CardHeader>
            <CardTitle>{l(locale, "Sales by Day", "Ventas por día")}</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d7c6a7" />
                <XAxis dataKey="date" tick={{ fill: "#7a6649", fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(v) => formatMoney(Number(v))} />
                <Line type="monotone" dataKey="total" stroke="#184270" strokeWidth={2.7} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="interactive-elevate overflow-hidden">
          <CardHeader>
            <CardTitle>{l(locale, "Sales by Hour", "Ventas por hora")}</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d7c6a7" />
                <XAxis dataKey="hour" tick={{ fill: "#7a6649", fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(v) => formatMoney(Number(v))} />
                <Bar dataKey="total" fill="#aa7e45" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="stagger-list grid gap-4 xl:grid-cols-3">
        <Card className="interactive-elevate">
          <CardHeader>
            <CardTitle>{l(locale, "Top Selling Items", "Ítems más vendidos")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {itemSales.slice(0, 8).map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-lg border border-[#e4d8c5] bg-white/80 px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} {l(locale, "sold", "vendidos")}
                  </p>
                </div>
                <span>{formatMoney(item.total)}</span>
              </div>
            ))}
            {itemSales.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {l(locale, "No sales in this range.", "No hay ventas en este rango.")}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="interactive-elevate">
          <CardHeader>
            <CardTitle>{l(locale, "Sales by Category", "Ventas por categoría")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categorySales.slice(0, 8).map((item) => (
              <div key={item.category} className="flex items-center justify-between rounded-lg border border-[#e4d8c5] bg-white/80 px-3 py-2 text-sm">
                <span className="font-medium">{item.category}</span>
                <span>{formatMoney(item.total)}</span>
              </div>
            ))}
            {categorySales.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {l(locale, "No category totals in this range.", "No hay totales por categoría en este rango.")}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="interactive-elevate">
          <CardHeader>
            <CardTitle>{l(locale, "Sales by Waiter", "Ventas por mesero")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {salesByWaiter.slice(0, 8).map((item) => (
              <div key={item.waiter} className="flex items-center justify-between rounded-lg border border-[#e4d8c5] bg-white/80 px-3 py-2 text-sm">
                <span className="font-medium">{item.waiter}</span>
                <span>{formatMoney(item.total)}</span>
              </div>
            ))}
            {salesByWaiter.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {l(locale, "No waiter sales in this range.", "No hay ventas por mesero en este rango.")}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="interactive-elevate">
        <CardHeader>
          <CardTitle>{l(locale, "Closed Orders", "Pedidos cerrados")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="luxury-scroll overflow-auto rounded-xl border border-[#dbcdb5]">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-[#f8efe0]">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.13em] text-[#846641]">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-t border-[#ebdfcd] bg-white/70 hover:bg-[#fff8eb]">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-sm text-muted-foreground" colSpan={3}>
                      {l(locale, "No closed orders for the selected filters.", "No hay pedidos cerrados para los filtros seleccionados.")}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
