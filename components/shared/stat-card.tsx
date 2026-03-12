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
    <Card className="group relative overflow-hidden">
      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-primary/10 transition group-hover:scale-110" />
      <CardContent className="relative p-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a7046]">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d43]">{value}</p>
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
