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
import { l, tableStatusLabel, type Locale } from "@/lib/i18n";
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
  preselectedOrderId,
  locale
}: {
  orders: OpenOrder[];
  preselectedOrderId?: string;
  locale: Locale;
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

      toast.success(l(locale, "Order closed and table released", "Pedido cerrado y mesa liberada"));
      closeDialog();
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Card className="interactive-elevate">
        <CardHeader className="pb-3">
          <CardTitle>{l(locale, "Open Checks", "Cuentas abiertas")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder={l(locale, "Search by table, waiter or order number", "Buscar por mesa, mesero o número de pedido")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="stagger-list mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((order) => (
              <button
                key={order.id}
                onClick={() => openCheckout(order.id)}
                className="rounded-xl border border-[#e4d8c5] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-soft"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">#{order.order_number}</p>
                  <span className="rounded-full bg-[#f8efe0] px-2 py-0.5 text-xs capitalize text-[#7b613a]">
                    {tableStatusLabel(locale, order.status)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {l(locale, "Table", "Mesa")} {order.floor_table?.table_code} · {order.floor_table?.display_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {l(locale, "Waiter", "Mesero")}: {order.waiter?.full_name ?? "-"}
                </p>
                <p className="mt-3 text-lg font-semibold text-[#1f2d43]">{formatMoney(Number(order.total))}</p>
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
        title={
          selectedOrder
            ? l(locale, `Close Order #${selectedOrder.order_number}`, `Cerrar pedido #${selectedOrder.order_number}`)
            : l(locale, "Close order", "Cerrar pedido")
        }
      >
        {selectedOrder ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#dbc9ad] bg-[#faf3e7] p-3">
              <p className="text-sm text-muted-foreground">{l(locale, "Table", "Mesa")}</p>
              <p className="font-medium">
                {selectedOrder.floor_table?.table_code} · {selectedOrder.floor_table?.display_name}
              </p>
              <p className="mt-2 text-xl font-semibold text-primary">
                {l(locale, "Total", "Total")}: {formatMoney(Number(selectedOrder.total))}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{l(locale, "Payment Method", "Método de pago")}</Label>
                <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="cash">{l(locale, "Cash", "Efectivo")}</option>
                  <option value="card">{l(locale, "Card", "Tarjeta")}</option>
                  <option value="transfer">{l(locale, "Transfer", "Transferencia")}</option>
                  <option value="other">{l(locale, "Other", "Otro")}</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{l(locale, "Amount Paid", "Monto pagado")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{l(locale, "Tip Amount", "Propina")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{l(locale, "Note", "Nota")}</Label>
                <Input value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeDialog}>
                {l(locale, "Cancel", "Cancelar")}
              </Button>
              <Button onClick={onConfirmPayment} disabled={isPending}>
                <CheckCircle2 className="h-4 w-4" />
                {l(locale, "Confirm Payment", "Confirmar pago")}
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
