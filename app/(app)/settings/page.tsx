import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { RestaurantSettingsForm } from "@/components/shared/settings-form";
import { getUserContextOrThrow, requireRoles } from "@/lib/auth";
import { getRestaurantSettings } from "@/lib/queries/settings";

export default async function SettingsPage() {
  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "super_admin"]);

  const data = await getRestaurantSettings(context.restaurantId!);
  const restaurant = data.restaurant
    ? { id: data.restaurant.id, name: data.restaurant.name }
    : null;
  const settings = data.settings
    ? {
        currency_code: data.settings.currency_code,
        tax_percent: Number(data.settings.tax_percent),
        service_charge_percent: Number(data.settings.service_charge_percent),
        allow_waiter_close_table: data.settings.allow_waiter_close_table
      }
    : null;

  return (
    <AppShell
      context={context}
      title="Restaurant Settings"
      subtitle="Operational defaults and policy settings"
    >
      {!restaurant ? (
        <EmptyState title="Restaurant not found" description="Check the selected restaurant membership." />
      ) : (
        <RestaurantSettingsForm restaurant={restaurant} settings={settings} />
      )}
    </AppShell>
  );
}
