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

type ClosedOrder = {
  id: string;
  closed_at: string;
  total: number;
  waiter: string;
};

const columnHelper = createColumnHelper<ClosedOrder>();

export function ReportsDashboard({
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
        header: "Closed At",
        cell: (info) => new Date(info.getValue()).toLocaleString()
      }),
      columnHelper.accessor("waiter", {
        header: "Waiter"
      }),
      columnHelper.accessor("total", {
        header: "Total",
        cell: (info) => formatMoney(info.getValue())
      })
    ],
    []
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
        <StatCard label="Total Sales" value={formatMoney(totalSales)} hint="Selected range" />
        <StatCard label="Orders" value={`${ordersCount}`} />
        <StatCard label="Avg Ticket" value={formatMoney(averageTicket)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Day</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(v) => formatMoney(Number(v))} />
                <Line type="monotone" dataKey="total" stroke="#0284c7" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Hour</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip formatter={(v) => formatMoney(Number(v))} />
                <Bar dataKey="total" fill="#0d9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {itemSales.slice(0, 8).map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity} sold</p>
                </div>
                <span>{formatMoney(item.total)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categorySales.slice(0, 8).map((item) => (
              <div key={item.category} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <span className="font-medium">{item.category}</span>
                <span>{formatMoney(item.total)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Waiter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {salesByWaiter.slice(0, 8).map((item) => (
              <div key={item.waiter} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <span className="font-medium">{item.waiter}</span>
                <span>{formatMoney(item.total)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Closed Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-xl border">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-3 py-2 text-left font-medium">
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
                  <tr key={row.id} className="border-t">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
