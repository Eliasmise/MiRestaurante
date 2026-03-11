"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Map,
  MenuSquare,
  Settings,
  UsersRound,
  Wallet,
  Wrench
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface AppSidebarProps {
  role: UserRole;
}

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
}

const baseNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "manager", "cashier", "waiter"] },
  { href: "/floor", label: "Floor", icon: Map, roles: ["manager", "waiter", "cashier", "super_admin"] },
  { href: "/floor/editor", label: "Layout Editor", icon: Wrench, roles: ["manager", "super_admin"] },
  { href: "/menu", label: "Menu", icon: MenuSquare, roles: ["manager", "super_admin"] },
  { href: "/assignments", label: "Assignments", icon: ClipboardList, roles: ["manager", "super_admin"] },
  { href: "/kitchen", label: "Kitchen", icon: ChefHat, roles: ["kitchen", "manager", "super_admin"] },
  { href: "/checkout", label: "Checkout", icon: Wallet, roles: ["cashier", "manager", "waiter", "super_admin"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["manager", "super_admin"] },
  { href: "/staff", label: "Staff", icon: UsersRound, roles: ["manager", "super_admin"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["manager", "super_admin"] }
];

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r bg-white/70 p-4 backdrop-blur lg:flex">
      <div className="mb-6 px-2">
        <p className="text-xs uppercase tracking-[0.28em] text-primary">Mi Restaurante</p>
        <h2 className="mt-2 text-lg font-semibold">Operations</h2>
      </div>

      <nav className="flex-1 space-y-1">
        {baseNav
          .filter((item) => item.roles.includes(role))
          .map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                href={item.href}
                key={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <Button variant="ghost" className="justify-start" onClick={signOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </aside>
  );
}
