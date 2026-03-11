import { Badge } from "@/components/ui/badge";
import type { UserContext } from "@/lib/types";

export function AppHeader({ context, title, subtitle }: { context: UserContext; title: string; subtitle: string }) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {context.restaurantName ? <Badge variant="secondary">{context.restaurantName}</Badge> : null}
          <Badge className="capitalize">{context.role.replace("_", " ")}</Badge>
          <Badge variant="outline">{context.fullName}</Badge>
        </div>
      </div>
    </header>
  );
}
