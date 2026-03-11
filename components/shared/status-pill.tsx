import { Badge } from "@/components/ui/badge";
import type { OrderItemStatus, OrderStatus, TableStatus } from "@/lib/types";

type Status = TableStatus | OrderStatus | OrderItemStatus;

const statusMap: Record<Status, { label: string; className: string }> = {
  available: { label: "Available", className: "bg-emerald-100 text-emerald-700" },
  occupied: { label: "Occupied", className: "bg-orange-100 text-orange-700" },
  ordering: { label: "Ordering", className: "bg-sky-100 text-sky-700" },
  sent_to_kitchen: { label: "Sent", className: "bg-indigo-100 text-indigo-700" },
  in_preparation: { label: "In prep", className: "bg-amber-100 text-amber-700" },
  ready: { label: "Ready", className: "bg-emerald-100 text-emerald-700" },
  needs_payment: { label: "Payment", className: "bg-rose-100 text-rose-700" },
  closed: { label: "Closed", className: "bg-slate-200 text-slate-700" },
  draft: { label: "Draft", className: "bg-slate-200 text-slate-700" },
  submitted: { label: "Submitted", className: "bg-indigo-100 text-indigo-700" },
  served: { label: "Served", className: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelled", className: "bg-rose-100 text-rose-700" },
  preparing: { label: "Preparing", className: "bg-amber-100 text-amber-700" },
  voided: { label: "Voided", className: "bg-rose-100 text-rose-700" }
};

export function StatusPill({ status }: { status: Status }) {
  const config = statusMap[status];
  return <Badge className={config.className}>{config.label}</Badge>;
}
