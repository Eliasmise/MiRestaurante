"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { closeOrderWithPayment } from "@/lib/actions/order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatMoney } from "@/lib/utils";

export interface OpenOrder {
  id: string;
  order_number: number;
  total: number;
  status: string;
  opened_at: string;
  floor_table: { table_code: string; display_name: string } | null;
  waiter: { full_name: string } | null;
}

export function CheckoutBoard({
  orders,
  preselectedOrderId
}: {
  orders: OpenOrder[];
  preselectedOrderId?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(preselectedOrderId ?? null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [amountPaid, setAmountPaid] = useState("");
  const [tipAmount, setTipAmount] = useState("0");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (!query.trim()) return orders;
    const q = query.toLowerCase();

    return orders.filter((order) => {
      return (
        `${order.order_number}`.includes(q) ||
        order.floor_table?.table_code.toLowerCase().includes(q) ||
        order.floor_table?.display_name.toLowerCase().includes(q) ||
        order.waiter?.full_name.toLowerCase().includes(q)
      );
    });
  }, [orders, query]);

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;

  function openCheckout(orderId: string) {
    const order = orders.find((item) => item.id === orderId);
    setSelectedOrderId(orderId);
    setAmountPaid(order ? String(order.total) : "");
    setTipAmount("0");
    setNote("");
  }

  function closeDialog() {
    setSelectedOrderId(null);
  }

  function onConfirmPayment() {
    if (!selectedOrder) return;

    startTransition(async () => {
      const result = await closeOrderWithPayment({
        orderId: selectedOrder.id,
        paymentMethod,
        amountPaid: Number(amountPaid),
        tipAmount: Number(tipAmount),
        note: note || null
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Order closed and table released");
      closeDialog();
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Open Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by table, waiter or order number"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((order) => (
              <button
                key={order.id}
                onClick={() => openCheckout(order.id)}
                className="rounded-xl border bg-white p-4 text-left transition hover:border-primary hover:shadow"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">#{order.order_number}</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                    {order.status.replaceAll("_", " ")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Table {order.floor_table?.table_code} · {order.floor_table?.display_name}
                </p>
                <p className="text-sm text-muted-foreground">Waiter: {order.waiter?.full_name ?? "-"}</p>
                <p className="mt-3 text-lg font-semibold text-primary">{formatMoney(Number(order.total))}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        title={selectedOrder ? `Close Order #${selectedOrder.order_number}` : "Close order"}
      >
        {selectedOrder ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-sm text-muted-foreground">Table</p>
              <p className="font-medium">
                {selectedOrder.floor_table?.table_code} · {selectedOrder.floor_table?.display_name}
              </p>
              <p className="mt-2 text-xl font-semibold text-primary">
                Total: {formatMoney(Number(selectedOrder.total))}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Transfer</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount Paid</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Tip Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Note</Label>
                <Input value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button onClick={onConfirmPayment} disabled={isPending}>
                <CheckCircle2 className="h-4 w-4" />
                Confirm Payment
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
