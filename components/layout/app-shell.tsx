import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { UserContext } from "@/lib/types";

export function AppShell({
  context,
  title,
  subtitle,
  children
}: {
  context: UserContext;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen surface-fade lg:flex">
      <AppSidebar role={context.role} />
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#d8c39d]/20 to-transparent" />
        <AppHeader context={context} title={title} subtitle={subtitle} />
        <MobileNav role={context.role} />
        <main className="relative p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1500px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
