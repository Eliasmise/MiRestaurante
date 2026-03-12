import { redirect } from "next/navigation";

import { localeOrDefault } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import type { UserContext, UserRole } from "@/lib/types";

const rolePriority: UserRole[] = [
  "super_admin",
  "manager",
  "cashier",
  "waiter",
  "kitchen"
];

function pickHighestRole(roles: UserRole[]): UserRole {
  return rolePriority.find((role) => roles.includes(role)) ?? "waiter";
}

export async function getUserContextOrThrow(): Promise<UserContext> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: memberships, error } = await supabase
    .from("restaurant_users")
    .select("restaurant_id, role, full_name, active, restaurants(name)")
    .eq("user_id", user.id)
    .eq("active", true);

  if (error || !memberships || memberships.length === 0) {
    throw new Error("No active restaurant membership found for user / No se encontró membresía activa para este usuario.");
  }

  const role = pickHighestRole(memberships.map((m) => m.role as UserRole));

  const scopedMembership =
    memberships.find((m) => m.role === role && m.restaurant_id) ??
    memberships.find((m) => m.restaurant_id) ??
    memberships[0];
  const restaurantRelation = (scopedMembership as { restaurants?: { name?: string } | Array<{ name?: string }> })
    .restaurants;
  let fallbackRestaurantId = scopedMembership.restaurant_id;
  let fallbackRestaurantName =
    Array.isArray(restaurantRelation) ? restaurantRelation[0]?.name ?? null : restaurantRelation?.name ?? null;
  let locale: UserContext["locale"] = "en";

  if (role === "super_admin" && !fallbackRestaurantId) {
    const { data: firstRestaurant } = await supabase
      .from("restaurants")
      .select("id, name")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (firstRestaurant) {
      fallbackRestaurantId = firstRestaurant.id;
      fallbackRestaurantName = firstRestaurant.name;
    }
  }

  if (fallbackRestaurantId) {
    const { data: settings } = await supabase
      .from("restaurant_settings")
      .select("language")
      .eq("restaurant_id", fallbackRestaurantId)
      .maybeSingle();
    locale = localeOrDefault(settings?.language);
  }

  return {
    userId: user.id,
    role,
    restaurantId: fallbackRestaurantId,
    fullName: scopedMembership.full_name ?? user.email ?? "Personal",
    restaurantName: fallbackRestaurantName,
    locale
  };
}

export function requireRoles(context: UserContext, allowed: UserRole[]) {
  if (!allowed.includes(context.role)) {
    redirect("/forbidden");
  }
}

export function roleHome(role: UserRole): string {
  switch (role) {
    case "kitchen":
      return "/kitchen";
    case "waiter":
      return "/floor";
    case "cashier":
      return "/checkout";
    default:
      return "/dashboard";
  }
}
