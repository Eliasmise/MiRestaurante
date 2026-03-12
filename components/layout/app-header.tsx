import { Badge } from "@/components/ui/badge";
import { roleLabel } from "@/lib/i18n";
import type { UserContext } from "@/lib/types";

export function AppHeader({ context, title, subtitle }: { context: UserContext; title: string; subtitle: string }) {
  const now = new Date();
  const nowLabel = now.toLocaleString(context.locale === "es" ? "es-HN" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });

  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-[#fbf6ec]/80 px-4 py-3 backdrop-blur md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1f2d43]">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{nowLabel}</Badge>
          {context.restaurantName ? <Badge variant="secondary">{context.restaurantName}</Badge> : null}
          <Badge>{roleLabel(context.locale, context.role)}</Badge>
          <Badge variant="outline">{context.fullName}</Badge>
        </div>
      </div>
    </header>
  );
}
