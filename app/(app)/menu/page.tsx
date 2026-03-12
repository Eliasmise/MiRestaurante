import { AppShell } from "@/components/layout/app-shell";
import { MenuManagement } from "@/components/menu/menu-management";
import { getUserContextOrThrow, requireRoles } from "@/lib/auth";
import { l } from "@/lib/i18n";
import { getMenuData } from "@/lib/queries/menu";

export default async function MenuPage() {
  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "super_admin"]);

  const data = await getMenuData(context.restaurantId!);
  const categories = data.categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    sort_order: category.sort_order
  }));
  const subcategories = data.subcategories.map((subcategory) => ({
    id: subcategory.id,
    category_id: subcategory.category_id,
    name: subcategory.name,
    sort_order: subcategory.sort_order
  }));
  const items = data.items.map((item) => ({
    id: item.id,
    category_id: item.category_id,
    subcategory_id: item.subcategory_id,
    name: item.name,
    price: item.price,
    prep_station: item.prep_station,
    is_active: item.is_active
  }));

  return (
    <AppShell
      context={context}
      title={l(context.locale, "Menu Management", "Gestión de menú")}
      subtitle={l(context.locale, "Categories, items, and pricing", "Categorías, ítems y precios")}
    >
      <MenuManagement
        restaurantId={context.restaurantId!}
        categories={categories}
        subcategories={subcategories}
        items={items}
        locale={context.locale}
      />
    </AppShell>
  );
}
