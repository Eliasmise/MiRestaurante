"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { assignWaiterToTable } from "@/lib/actions/floor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FloorTable } from "@/lib/types";

export function WaiterAssignments({
  tables,
  waiters
}: {
  tables: FloorTable[];
  waiters: Array<{ user_id: string; full_name: string }>;
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

      toast.success("Assignment updated");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Waiter to Table Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-xl border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2">Table</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Seats</th>
                <th className="px-3 py-2">Current Status</th>
                <th className="px-3 py-2">Assigned Waiter</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table) => (
                <tr key={table.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{table.table_code}</td>
                  <td className="px-3 py-2">{table.display_name}</td>
                  <td className="px-3 py-2">{table.seats}</td>
                  <td className="px-3 py-2 capitalize">{table.status.replaceAll("_", " ")}</td>
                  <td className="px-3 py-2">
                    <select
                      className="h-9 rounded-lg border border-input bg-background px-2"
                      defaultValue={table.assigned_waiter_id ?? ""}
                      onChange={(e) => onAssign(table.id, e.target.value)}
                      disabled={isPending}
                    >
                      <option value="">Unassigned</option>
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
