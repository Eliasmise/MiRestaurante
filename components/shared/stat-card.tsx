import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        {hint ? (
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowUpRight className="h-3 w-3" />
            {hint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
