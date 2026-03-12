"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { navForRole } from "@/components/layout/nav-items";

interface AppSidebarProps {
  role: UserRole;
}

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const baseNav = navForRole(role);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-[18rem] flex-col border-r border-white/70 bg-gradient-to-b from-[#fdfaf2]/90 to-[#f3ece0]/70 p-4 backdrop-blur lg:flex">
      <div className="mb-7 rounded-2xl border border-white/80 bg-white/65 p-4 shadow-soft">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#8a7046]">Mi Restaurante</p>
        <h2 className="mt-2 text-xl font-semibold text-[#1f2d43]">Hospitality OS</h2>
        <p className="mt-1 text-xs text-muted-foreground">Luxury operations command</p>
      </div>

      <nav className="flex-1 space-y-1">
        <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a7046]">
          Workspace
        </p>
        {baseNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                href={item.href}
                key={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-gradient-to-br from-primary via-primary to-[#123a62] text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-white/80 hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", !active && "group-hover:scale-105 transition")} />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <Button variant="outline" className="justify-start bg-white/80" onClick={signOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </aside>
  );
}
