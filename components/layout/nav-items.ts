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

export interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "manager", "cashier", "waiter"] },
  { href: "/floor", label: "Floor", icon: Map, roles: ["manager", "waiter", "cashier", "super_admin"] },
  { href: "/floor/editor", label: "Layout", icon: Wrench, roles: ["manager", "super_admin"] },
  { href: "/menu", label: "Menu", icon: MenuSquare, roles: ["manager", "super_admin"] },
  { href: "/assignments", label: "Assignments", icon: ClipboardList, roles: ["manager", "super_admin"] },
  { href: "/kitchen", label: "Kitchen", icon: ChefHat, roles: ["kitchen", "manager", "super_admin"] },
  { href: "/checkout", label: "Checkout", icon: Wallet, roles: ["cashier", "manager", "waiter", "super_admin"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["manager", "super_admin"] },
  { href: "/staff", label: "Staff", icon: UsersRound, roles: ["manager", "super_admin"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["manager", "super_admin"] }
];

export function navForRole(role: UserRole) {
  return navItems.filter((item) => item.roles.includes(role));
}
