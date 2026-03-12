import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { RestaurantSettingsForm } from "@/components/shared/settings-form";
import { getUserContextOrThrow, requireRoles } from "@/lib/auth";
import { l, localeOrDefault } from "@/lib/i18n";
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
        allow_waiter_close_table: data.settings.allow_waiter_close_table,
        language: localeOrDefault(data.settings.language)
      }
    : null;
  const locale = context.locale;

  return (
    <AppShell
      context={context}
      title={l(locale, "Restaurant Settings", "Configuración del restaurante")}
      subtitle={l(locale, "Operational defaults and policy settings", "Políticas y valores operativos")}
    >
      {!restaurant ? (
        <EmptyState
          title={l(locale, "Restaurant not found", "Restaurante no encontrado")}
          description={l(locale, "Check the selected restaurant membership.", "Verifica la membresía seleccionada.")}
        />
      ) : (
        <RestaurantSettingsForm restaurant={restaurant} settings={settings} locale={locale} />
      )}
    </AppShell>
  );
}
