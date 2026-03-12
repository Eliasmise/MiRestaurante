"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  addOrderItem,
  removeOrVoidOrderItem,
  sendOrderItemsToKitchen,
  updateOrderItemQuantity
} from "@/lib/actions/order";
import { LocalizedStatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { l, type Locale } from "@/lib/i18n";
import type { OrderItemStatus, TableStatus } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export interface OrderWorkspaceProps {
  restaurantId: string;
  locale: Locale;
  tableId: string;
  table: { table_code: string; display_name: string; status: string };
  order: {
    id: string;
    status: string;
    order_number: number;
    subtotal: number;
    tax_total: number;
    service_charge_total: number;
    discount_total: number;
    total: number;
  } | null;
  items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    item_total: number;
    status: string;
    note: string | null;
    modifier_summary: string | null;
    menu_items: { name: string } | null;
  }>;
  categories: Array<{ id: string; name: string }>;
  subcategories: Array<{ id: string; category_id: string; name: string }>;
  menuItems: Array<{
    id: string;
    category_id: string;
    subcategory_id: string | null;
    name: string;
    description: string | null;
    price: number;
    is_active: boolean;
  }>;
  modifierMap: Record<
    string,
    Array<{
      id: string;
      name: string;
      is_required: boolean;
      min_select: number;
      max_select: number;
      options: Array<{ id: string; name: string; price_delta: number; is_active: boolean }>;
    }>
  >;
}

export function TableOrderWorkspace({
  tableId,
  table,
  order,
  items,
  categories,
  subcategories,
  menuItems,
  modifierMap,
  locale
}: OrderWorkspaceProps) {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id ?? "");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [chosenOptions, setChosenOptions] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  const selectedItem = menuItems.find((item) => item.id === selectedItemId) ?? null;

  const categorySubcategories = useMemo(
    () => subcategories.filter((sub) => sub.category_id === selectedCategory),
    [selectedCategory, subcategories]
  );

  const visibleMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (!item.is_active) return false;
      if (item.category_id !== selectedCategory) return false;
      if (selectedSubcategory === "all") return true;
      return item.subcategory_id === selectedSubcategory;
    });
  }, [menuItems, selectedCategory, selectedSubcategory]);

  const draftItems = items.filter((item) => item.status === "draft");

  function toggleOption(optionId: string) {
    setChosenOptions((current) => ({
      ...current,
      [optionId]: !current[optionId]
    }));
  }

  function closeDialog() {
    setSelectedItemId(null);
    setQty(1);
    setNote("");
    setChosenOptions({});
  }

  function onAddItem() {
    if (!selectedItem) return;

    const groups = modifierMap[selectedItem.id] ?? [];
    const selectedOptions = groups
      .flatMap((group) => group.options)
      .filter((option) => chosenOptions[option.id]);

    for (const group of groups) {
      const selectedCount = group.options.filter((option) => chosenOptions[option.id]).length;
      if (group.is_required && selectedCount < group.min_select) {
        toast.error(
          l(
            locale,
            `Select at least ${group.min_select} option(s) for ${group.name}`,
            `Selecciona al menos ${group.min_select} opción(es) para ${group.name}`
          )
        );
        return;
      }
      if (selectedCount > group.max_select) {
        toast.error(
          l(
            locale,
            `Select up to ${group.max_select} option(s) for ${group.name}`,
            `Selecciona hasta ${group.max_select} opción(es) para ${group.name}`
          )
        );
        return;
      }
    }

    startTransition(async () => {
      const result = await addOrderItem({
        tableId,
        menuItemId: selectedItem.id,
        quantity: qty,
        note,
        modifiers: selectedOptions.map((option) => ({
          modifier_option_id: option.id,
          name: option.name,
          price_delta: Number(option.price_delta)
        }))
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(l(locale, `${selectedItem.name} added`, `${selectedItem.name} agregado`));
      closeDialog();
      router.refresh();
    });
  }

  function onSendDraft() {
    if (!order || draftItems.length === 0) {
      toast.error(l(locale, "No draft items to send", "No hay ítems borrador para enviar"));
      return;
    }

    startTransition(async () => {
      const result = await sendOrderItemsToKitchen({
        orderId: order.id,
        itemIds: draftItems.map((item) => item.id)
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(l(locale, "Items sent to kitchen", "Ítems enviados a cocina"));
      router.refresh();
    });
  }

  function onChangeQty(itemId: string, quantity: number) {
    startTransition(async () => {
      const result = await updateOrderItemQuantity({ orderItemId: itemId, quantity });
      if (!result.success) toast.error(result.error);
      else router.refresh();
    });
  }

  function onRemoveItem(itemId: string) {
    startTransition(async () => {
      const result = await removeOrVoidOrderItem({
        orderItemId: itemId,
        reason: l(locale, "Removed from waiter screen", "Eliminado desde pantalla de mesero")
      });
      if (!result.success) toast.error(result.error);
      else {
        toast.success(l(locale, "Item removed", "Ítem eliminado"));
        router.refresh();
      }
    });
  }

  const groups = selectedItem ? modifierMap[selectedItem.id] ?? [] : [];

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
      <Card className="interactive-elevate overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">
                {table.table_code} · {table.display_name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {l(locale, "Order status and live bill", "Estado del pedido y cuenta en vivo")}
              </p>
            </div>
            <LocalizedStatusPill status={table.status as TableStatus} locale={locale} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 luxury-scroll">
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#cfb487] bg-[#faf2e5] p-6 text-center text-sm text-muted-foreground">
              {l(
                locale,
                "No items yet. Tap a menu item on the right to start this table.",
                "Aún no hay ítems. Toca un producto a la derecha para comenzar esta mesa."
              )}
            </div>
          ) : (
            <div className="stagger-list space-y-2">
              {items.map((item) => (
                <div key={item.id} className="interactive-elevate rounded-xl border border-[#e4d8c5] bg-white/90 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {item.quantity}x {item.menu_items?.name ?? l(locale, "Item", "Ítem")}
                      </p>
                      {item.modifier_summary ? (
                        <p className="text-xs text-muted-foreground">{item.modifier_summary}</p>
                      ) : null}
                      {item.note ? <p className="text-xs italic text-muted-foreground">{item.note}</p> : null}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatMoney(Number(item.item_total))}</p>
                      <LocalizedStatusPill status={item.status as OrderItemStatus} locale={locale} />
                    </div>
                  </div>

                  {item.status === "draft" ? (
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onChangeQty(item.id, Math.max(1, item.quantity - 1))}
                        disabled={isPending}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onChangeQty(item.id, Math.min(20, item.quantity + 1))}
                        disabled={isPending}
                      >
                        +
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {l(locale, "Sent items can only be voided by role policy.", "Los ítems enviados solo pueden anularse según políticas de rol.")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-[#dbc9ad] bg-[#faf3e7] p-4">
            <div className="grid gap-1 text-sm">
              <div className="flex items-center justify-between">
                <span>{l(locale, "Subtotal", "Subtotal")}</span>
                <span>{formatMoney(Number(order?.subtotal ?? 0))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{l(locale, "Tax", "Impuesto")}</span>
                <span>{formatMoney(Number(order?.tax_total ?? 0))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{l(locale, "Service", "Servicio")}</span>
                <span>{formatMoney(Number(order?.service_charge_total ?? 0))}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold">
                <span>{l(locale, "Total", "Total")}</span>
                <span>{formatMoney(Number(order?.total ?? 0))}</span>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 z-10 rounded-xl border border-[#d4c2a6] bg-[#fffaf1]/95 p-3 backdrop-blur">
            <div className="flex flex-wrap gap-2">
              <Button className="flex-1" onClick={onSendDraft} disabled={!order || draftItems.length === 0 || isPending}>
                <Send className="h-4 w-4" />
                {l(locale, "Send", "Enviar")}{" "}
                {draftItems.length > 0
                  ? l(locale, `${draftItems.length} draft`, `${draftItems.length} borrador`)
                  : l(locale, "to kitchen", "a cocina")}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => router.push(`/checkout?order=${order?.id ?? ""}`)}
                disabled={!order}
              >
                {l(locale, "Go to checkout", "Ir a cobro")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="interactive-elevate overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">{l(locale, "Add Items", "Agregar ítems")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {l(locale, "Large touch targets for rapid ordering", "Botones grandes para pedir con rapidez")}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="luxury-scroll flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setSelectedSubcategory("all");
                }}
              >
                {category.name}
              </Button>
            ))}
          </div>

          <div className="luxury-scroll flex gap-2 overflow-x-auto pb-1">
            <Button
              size="sm"
              variant={selectedSubcategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedSubcategory("all")}
            >
              {l(locale, "All", "Todos")}
            </Button>
            {categorySubcategories.map((subcategory) => (
              <Button
                key={subcategory.id}
                size="sm"
                variant={selectedSubcategory === subcategory.id ? "default" : "outline"}
                onClick={() => setSelectedSubcategory(subcategory.id)}
              >
                {subcategory.name}
              </Button>
            ))}
          </div>

          <div className="luxury-scroll stagger-list grid max-h-[62vh] grid-cols-1 gap-2 overflow-y-auto pr-1 md:grid-cols-2">
            {visibleMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className="rounded-xl border border-[#e4d8c5] bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-soft"
              >
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="line-clamp-2 min-h-[2.5rem] text-xs text-muted-foreground">
                  {item.description ?? l(locale, "No description", "Sin descripción")}
                </p>
                <p className="mt-2 text-base font-semibold text-[#1f2d43]">{formatMoney(Number(item.price))}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedItem)}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        title={selectedItem ? l(locale, `Add ${selectedItem.name}`, `Agregar ${selectedItem.name}`) : l(locale, "Add item", "Agregar ítem")}
      >
        {selectedItem ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{l(locale, "Quantity", "Cantidad")}</Label>
                <Input
                  type="number"
                  value={qty}
                  min={1}
                  max={20}
                  onChange={(e) => setQty(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                />
              </div>
              <div className="space-y-2">
                <Label>{l(locale, "Base price", "Precio base")}</Label>
                <Input value={formatMoney(Number(selectedItem.price))} readOnly />
              </div>
            </div>

            <div className="luxury-scroll max-h-52 space-y-3 overflow-y-auto rounded-xl border border-[#decfaf] bg-[#fdf9f2] p-3">
              {groups.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {l(locale, "No modifiers for this item.", "Este ítem no tiene modificadores.")}
                </p>
              ) : (
                groups.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <p className="text-sm font-semibold">
                      {group.name}
                      {group.is_required ? <span className="ml-1 text-rose-600">*</span> : null}
                    </p>
                    <div className="space-y-1">
                      {group.options
                        .filter((option) => option.is_active)
                        .map((option) => (
                          <label
                            key={option.id}
                            className="flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm"
                          >
                            <span>{option.name}</span>
                            <span className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {option.price_delta
                                  ? `+${formatMoney(Number(option.price_delta))}`
                                  : l(locale, "Included", "Incluido")}
                              </span>
                              <input
                                type="checkbox"
                                checked={Boolean(chosenOptions[option.id])}
                                onChange={() => toggleOption(option.id)}
                              />
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2">
              <Label>{l(locale, "Special instruction", "Instrucción especial")}</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={l(
                  locale,
                  "No onion, extra cheese, sauce on side...",
                  "Sin cebolla, extra queso, salsa aparte..."
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeDialog}>
                {l(locale, "Cancel", "Cancelar")}
              </Button>
              <Button onClick={onAddItem} disabled={isPending}>
                <Plus className="h-4 w-4" />
                {l(locale, "Add to order", "Agregar al pedido")}
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
