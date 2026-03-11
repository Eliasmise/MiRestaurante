import { AppShell } from "@/components/layout/app-shell";
import { MenuItemForm } from "@/components/menu/menu-item-form";
import { getUserContextOrThrow, requireRoles } from "@/lib/auth";
import { getMenuData } from "@/lib/queries/menu";

export default async function NewMenuItemPage() {
  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "super_admin"]);

  const data = await getMenuData(context.restaurantId!);

  return (
    <AppShell
      context={context}
      title="Menu Item Editor"
      subtitle="Create and configure menu items"
    >
      <MenuItemForm
        restaurantId={context.restaurantId!}
        categories={data.categories.map((category) => ({ id: category.id, name: category.name }))}
        subcategories={data.subcategories.map((subcategory) => ({
          id: subcategory.id,
          category_id: subcategory.category_id,
          name: subcategory.name
        }))}
      />
    </AppShell>
  );
}
