"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateRestaurantSettings, updateStaffRole } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RestaurantSettingsForm({
  restaurant,
  settings
}: {
  restaurant: { id: string; name: string };
  settings: {
    currency_code: string;
    tax_percent: number;
    service_charge_percent: number;
    allow_waiter_close_table: boolean;
  } | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(restaurant.name);
  const [currencyCode, setCurrencyCode] = useState(settings?.currency_code ?? "USD");
  const [taxPercent, setTaxPercent] = useState(String(settings?.tax_percent ?? 15));
  const [servicePercent, setServicePercent] = useState(String(settings?.service_charge_percent ?? 10));
  const [allowWaiterClose, setAllowWaiterClose] = useState(settings?.allow_waiter_close_table ?? true);
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await updateRestaurantSettings({
        restaurantId: restaurant.id,
        name,
        currencyCode,
        taxPercent: Number(taxPercent),
        serviceChargePercent: Number(servicePercent),
        allowWaiterCloseTable: allowWaiterClose
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Settings updated");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Restaurant Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Currency</Label>
            <Input value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())} />
          </div>
          <div className="space-y-2">
            <Label>Tax %</Label>
            <Input
              type="number"
              value={taxPercent}
              onChange={(e) => setTaxPercent(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Service %</Label>
            <Input
              type="number"
              value={servicePercent}
              onChange={(e) => setServicePercent(e.target.value)}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={allowWaiterClose}
            onChange={(e) => setAllowWaiterClose(e.target.checked)}
          />
          Allow waiters to close tables
        </label>
        <Button onClick={submit} disabled={isPending}>
          Save settings
        </Button>
      </CardContent>
    </Card>
  );
}

export function StaffManagementTable({
  restaurantId,
  staff
}: {
  restaurantId: string;
  staff: Array<{ user_id: string; full_name: string; role: string; active: boolean }>;
}) {
  const [isPending, startTransition] = useTransition();

  function updateRole(userId: string, role: string, active: boolean) {
    startTransition(async () => {
      const result = await updateStaffRole({ userId, restaurantId, role, active });
      if (!result.success) toast.error(result.error);
      else toast.success("Staff updated");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-xl border">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Active</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.user_id} className="border-t">
                  <td className="px-3 py-2 font-medium">{member.full_name}</td>
                  <td className="px-3 py-2">
                    <select
                      className="h-9 rounded-lg border border-input bg-background px-2"
                      value={member.role}
                      onChange={(e) => updateRole(member.user_id, e.target.value, member.active)}
                      disabled={isPending}
                    >
                      <option value="manager">Manager</option>
                      <option value="waiter">Waiter</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="cashier">Cashier</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={member.active}
                      onChange={(e) => updateRole(member.user_id, member.role, e.target.checked)}
                      disabled={isPending}
                    />
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
