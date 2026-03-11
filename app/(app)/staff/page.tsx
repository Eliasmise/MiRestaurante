import { AppShell } from "@/components/layout/app-shell";
import { StaffManagementTable } from "@/components/shared/settings-form";
import { getUserContextOrThrow, requireRoles } from "@/lib/auth";
import { getRestaurantSettings } from "@/lib/queries/settings";

export default async function StaffPage() {
  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "super_admin"]);

  const data = await getRestaurantSettings(context.restaurantId!);
  const staff = data.staff.map((member) => ({
    user_id: member.user_id,
    full_name: member.full_name,
    role: member.role,
    active: member.active
  }));

  return (
    <AppShell
      context={context}
      title="Staff Management"
      subtitle="Role permissions and active access control"
    >
      <StaffManagementTable
        restaurantId={context.restaurantId!}
        staff={staff}
      />
    </AppShell>
  );
}
