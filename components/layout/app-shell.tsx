import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
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
    <div className="min-h-screen lg:flex">
      <AppSidebar role={context.role} />
      <div className="flex-1">
        <AppHeader context={context} title={title} subtitle={subtitle} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
