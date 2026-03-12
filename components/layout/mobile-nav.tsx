"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navForRole, navLabel } from "@/components/layout/nav-items";
import type { Locale } from "@/lib/i18n";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MobileNav({ role, locale }: { role: UserRole; locale: Locale }) {
  const pathname = usePathname();
  const items = navForRole(role);

  return (
    <div className="lg:hidden">
      <div className="luxury-scroll flex gap-2 overflow-x-auto border-b border-white/70 bg-[#fbf6ec]/80 px-4 pb-3 pt-2 backdrop-blur">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-[#d8c5a3] bg-white/70 text-[#3b4d67]"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {navLabel(item, locale)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
