"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateRestaurantSettings, updateStaffRole } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { l, roleLabel, type Locale } from "@/lib/i18n";
import type { UserRole } from "@/lib/types";

export function RestaurantSettingsForm({
  restaurant,
  settings,
  locale
}: {
  restaurant: { id: string; name: string };
  settings: {
    currency_code: string;
    tax_percent: number;
    service_charge_percent: number;
    allow_waiter_close_table: boolean;
    language: Locale;
  } | null;
  locale: Locale;
}) {
  const router = useRouter();
  const [name, setName] = useState(restaurant.name);
  const [currencyCode, setCurrencyCode] = useState(settings?.currency_code ?? "USD");
  const [taxPercent, setTaxPercent] = useState(String(settings?.tax_percent ?? 15));
  const [servicePercent, setServicePercent] = useState(String(settings?.service_charge_percent ?? 10));
  const [allowWaiterClose, setAllowWaiterClose] = useState(settings?.allow_waiter_close_table ?? true);
  const [language, setLanguage] = useState<Locale>(settings?.language ?? locale);
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await updateRestaurantSettings({
        restaurantId: restaurant.id,
        name,
        currencyCode,
        taxPercent: Number(taxPercent),
        serviceChargePercent: Number(servicePercent),
        allowWaiterCloseTable: allowWaiterClose,
        language
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(l(language, "Settings updated", "Configuración actualizada"));
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{l(locale, "Restaurant Settings", "Configuración del restaurante")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{l(locale, "Name", "Nombre")}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-2">
            <Label>{l(locale, "Currency", "Moneda")}</Label>
            <Input value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())} />
          </div>
          <div className="space-y-2">
            <Label>{l(locale, "Tax %", "Impuesto %")}</Label>
            <Input
              type="number"
              value={taxPercent}
              onChange={(e) => setTaxPercent(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{l(locale, "Service %", "Servicio %")}</Label>
            <Input
              type="number"
              value={servicePercent}
              onChange={(e) => setServicePercent(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{l(locale, "Language", "Idioma")}</Label>
            <Select value={language} onChange={(e) => setLanguage(e.target.value as Locale)}>
              <option value="en">{l(locale, "English", "Inglés")}</option>
              <option value="es">{l(locale, "Spanish", "Español")}</option>
            </Select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={allowWaiterClose}
            onChange={(e) => setAllowWaiterClose(e.target.checked)}
          />
          {l(locale, "Allow waiters to close tables", "Permitir que meseros cierren mesas")}
        </label>
        <Button onClick={submit} disabled={isPending}>
          {l(locale, "Save settings", "Guardar configuración")}
        </Button>
      </CardContent>
    </Card>
  );
}

export function StaffManagementTable({
  restaurantId,
  staff,
  locale
}: {
  restaurantId: string;
  staff: Array<{ user_id: string; full_name: string; role: string; active: boolean }>;
  locale: Locale;
}) {
  const [isPending, startTransition] = useTransition();

  function updateRole(userId: string, role: string, active: boolean) {
    startTransition(async () => {
      const result = await updateStaffRole({ userId, restaurantId, role, active });
      if (!result.success) toast.error(result.error);
      else toast.success(l(locale, "Staff updated", "Personal actualizado"));
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{l(locale, "Staff Management", "Gestión de personal")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-xl border">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2">{l(locale, "Name", "Nombre")}</th>
                <th className="px-3 py-2">{l(locale, "Role", "Rol")}</th>
                <th className="px-3 py-2">{l(locale, "Active", "Activo")}</th>
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
                      <option value="manager">{roleLabel(locale, "manager" as UserRole)}</option>
                      <option value="waiter">{roleLabel(locale, "waiter" as UserRole)}</option>
                      <option value="kitchen">{roleLabel(locale, "kitchen" as UserRole)}</option>
                      <option value="cashier">{roleLabel(locale, "cashier" as UserRole)}</option>
                      <option value="super_admin">{roleLabel(locale, "super_admin" as UserRole)}</option>
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
