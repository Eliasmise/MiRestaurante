import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-10 text-center">
        <p className="text-lg font-semibold text-[#1f2d43]">{title}</p>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
