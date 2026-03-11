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

interface MenuItemFormProps {
  restaurantId: string;
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

export function MenuItemForm({ restaurantId, categories, subcategories, initial }: MenuItemFormProps) {
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

      toast.success(initial?.id ? "Item updated" : "Item created");
      router.push("/menu");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initial?.id ? "Edit menu item" : "New menu item"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Subcategory</Label>
            <Select value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)}>
              <option value="">None</option>
              {scopedSubcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Price</Label>
            <Input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tax %</Label>
            <Input type="number" step="0.1" min="0" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Sort order</Label>
            <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Prep station</Label>
            <Input value={prepStation} onChange={(e) => setPrepStation(e.target.value)} placeholder="grill, bar, fry" />
          </div>
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active item
        </label>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? "Saving..." : "Save item"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
