import {
  BarChart3,
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  Map,
  MenuSquare,
  Settings,
  UsersRound,
  Wallet,
  Wrench
} from "lucide-react";

import type { UserRole } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

export interface NavItem {
  href: string;
  label: { en: string; es: string };
  icon: typeof LayoutDashboard;
  roles: UserRole[];
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: { en: "Dashboard", es: "Panel" }, icon: LayoutDashboard, roles: ["super_admin", "manager", "cashier", "waiter"] },
  { href: "/floor", label: { en: "Floor", es: "Salón" }, icon: Map, roles: ["manager", "waiter", "cashier", "super_admin"] },
  { href: "/floor/editor", label: { en: "Layout", es: "Plano" }, icon: Wrench, roles: ["manager", "super_admin"] },
  { href: "/menu", label: { en: "Menu", es: "Menú" }, icon: MenuSquare, roles: ["manager", "super_admin"] },
  { href: "/assignments", label: { en: "Assignments", es: "Asignaciones" }, icon: ClipboardList, roles: ["manager", "super_admin"] },
  { href: "/kitchen", label: { en: "Kitchen", es: "Cocina" }, icon: ChefHat, roles: ["kitchen", "manager", "super_admin"] },
  { href: "/checkout", label: { en: "Checkout", es: "Cobro" }, icon: Wallet, roles: ["cashier", "manager", "waiter", "super_admin"] },
  { href: "/reports", label: { en: "Reports", es: "Reportes" }, icon: BarChart3, roles: ["manager", "super_admin"] },
  { href: "/staff", label: { en: "Staff", es: "Personal" }, icon: UsersRound, roles: ["manager", "super_admin"] },
  { href: "/settings", label: { en: "Settings", es: "Configuración" }, icon: Settings, roles: ["manager", "super_admin"] }
];

export function navForRole(role: UserRole) {
  return navItems.filter((item) => item.roles.includes(role));
}

export function navLabel(item: NavItem, locale: Locale) {
  return item.label[locale] ?? item.label.en;
}
