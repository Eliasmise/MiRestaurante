"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { upsertMenuItem } from "@/lib/actions/menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { l, type Locale } from "@/lib/i18n";

interface MenuItemFormProps {
  restaurantId: string;
  locale: Locale;
  categories: Array<{ id: string; name: string }>;
  subcategories: Array<{ id: string; category_id: string; name: string }>;
  initial?: {
    id?: string;
    category_id?: string;
    subcategory_id?: string | null;
    name?: string;
    description?: string | null;
    price?: number;
    prep_station?: string | null;
    tax_rate?: number;
    sort_order?: number;
    image_url?: string | null;
    is_active?: boolean;
  };
}

export function MenuItemForm({ restaurantId, locale, categories, subcategories, initial }: MenuItemFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [categoryId, setCategoryId] = useState(initial?.category_id ?? categories[0]?.id ?? "");
  const [subcategoryId, setSubcategoryId] = useState<string>(initial?.subcategory_id ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? 0));
  const [prepStation, setPrepStation] = useState(initial?.prep_station ?? "");
  const [taxRate, setTaxRate] = useState(String((initial?.tax_rate ?? 0.15) * 100));
  const [sortOrder, setSortOrder] = useState(String(initial?.sort_order ?? 0));
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  const scopedSubcategories = useMemo(
    () => subcategories.filter((item) => item.category_id === categoryId),
    [categoryId, subcategories]
  );

  function submit() {
    startTransition(async () => {
      const result = await upsertMenuItem({
        id: initial?.id,
        restaurantId,
        categoryId,
        subcategoryId: subcategoryId || null,
        name,
        description: description || null,
        price: Number(price),
        prepStation: prepStation || null,
        taxRate: Number(taxRate) / 100,
        sortOrder: Number(sortOrder),
        imageUrl: imageUrl || null,
        isActive
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(initial?.id ? l(locale, "Item updated", "Ítem actualizado") : l(locale, "Item created", "Ítem creado"));
      router.push("/menu");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initial?.id ? l(locale, "Edit menu item", "Editar ítem del menú") : l(locale, "New menu item", "Nuevo ítem del menú")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{l(locale, "Category", "Categoría")}</Label>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{l(locale, "Subcategory", "Subcategoría")}</Label>
            <Select value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)}>
              <option value="">{l(locale, "None", "Ninguna")}</option>
              {scopedSubcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{l(locale, "Name", "Nombre")}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>{l(locale, "Description", "Descripción")}</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>{l(locale, "Price", "Precio")}</Label>
            <Input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{l(locale, "Tax %", "Impuesto %")}</Label>
            <Input type="number" step="0.1" min="0" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{l(locale, "Sort order", "Orden")}</Label>
            <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{l(locale, "Prep station", "Estación de preparación")}</Label>
            <Input
              value={prepStation}
              onChange={(e) => setPrepStation(e.target.value)}
              placeholder={l(locale, "grill, bar, fry", "parrilla, bar, freidora")}
            />
          </div>
          <div className="space-y-2">
            <Label>{l(locale, "Image URL", "URL de imagen")}</Label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          {l(locale, "Active item", "Ítem activo")}
        </label>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            {l(locale, "Cancel", "Cancelar")}
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? l(locale, "Saving...", "Guardando...") : l(locale, "Save item", "Guardar ítem")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
