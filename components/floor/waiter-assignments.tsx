"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { assignWaiterToTable } from "@/lib/actions/floor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { l, tableStatusLabel, type Locale } from "@/lib/i18n";
import type { FloorTable } from "@/lib/types";

export function WaiterAssignments({
  tables,
  waiters,
  locale
}: {
  tables: FloorTable[];
  waiters: Array<{ user_id: string; full_name: string }>;
  locale: Locale;
}) {
  const [isPending, startTransition] = useTransition();

  function onAssign(tableId: string, waiterId: string) {
    startTransition(async () => {
      const result = await assignWaiterToTable({
        tableId,
        waiterId: waiterId || null
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(l(locale, "Assignment updated", "Asignación actualizada"));
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{l(locale, "Waiter to Table Assignment", "Asignación de mesas por mesero")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-xl border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2">{l(locale, "Table", "Mesa")}</th>
                <th className="px-3 py-2">{l(locale, "Name", "Nombre")}</th>
                <th className="px-3 py-2">{l(locale, "Seats", "Asientos")}</th>
                <th className="px-3 py-2">{l(locale, "Current Status", "Estado actual")}</th>
                <th className="px-3 py-2">{l(locale, "Assigned Waiter", "Mesero asignado")}</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table) => (
                <tr key={table.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{table.table_code}</td>
                  <td className="px-3 py-2">{table.display_name}</td>
                  <td className="px-3 py-2">{table.seats}</td>
                  <td className="px-3 py-2 capitalize">{tableStatusLabel(locale, table.status)}</td>
                  <td className="px-3 py-2">
                    <select
                      className="h-9 rounded-lg border border-input bg-background px-2"
                      defaultValue={table.assigned_waiter_id ?? ""}
                      onChange={(e) => onAssign(table.id, e.target.value)}
                      disabled={isPending}
                    >
                      <option value="">{l(locale, "Unassigned", "Sin asignar")}</option>
                      {waiters.map((waiter) => (
                        <option key={waiter.user_id} value={waiter.user_id}>
                          {waiter.full_name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
