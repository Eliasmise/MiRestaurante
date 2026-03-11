"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { upsertMenuCategory, upsertMenuSubcategory } from "@/lib/actions/menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/utils";

interface MenuManagementProps {
  restaurantId: string;
  categories: Array<{ id: string; name: string; slug: string; sort_order: number }>;
  subcategories: Array<{ id: string; category_id: string; name: string; sort_order: number }>;
  items: Array<{
    id: string;
    category_id: string;
    subcategory_id: string | null;
    name: string;
    price: number;
    prep_station: string | null;
    is_active: boolean;
  }>;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function MenuManagement({
  restaurantId,
  categories,
  subcategories,
  items
}: MenuManagementProps) {
  const router = useRouter();
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryCategoryId, setSubcategoryCategoryId] = useState(categories[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();

  function createCategory() {
    if (!categoryName.trim()) return;

    startTransition(async () => {
      const result = await upsertMenuCategory({
        restaurantId,
        name: categoryName,
        slug: slugify(categoryName),
        sortOrder: categories.length + 1,
        isActive: true
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Category created");
      setCategoryName("");
      router.refresh();
    });
  }

  function createSubcategory() {
    if (!subcategoryName.trim() || !subcategoryCategoryId) return;

    const sortOrder = subcategories.filter((item) => item.category_id === subcategoryCategoryId).length + 1;

    startTransition(async () => {
      const result = await upsertMenuSubcategory({
        restaurantId,
        categoryId: subcategoryCategoryId,
        name: subcategoryName,
        sortOrder,
        isActive: true
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Subcategory created");
      setSubcategoryName("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
            </div>
            <Button onClick={createCategory} disabled={isPending}>
              <Plus className="h-4 w-4" />
              Add category
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Subcategory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                value={subcategoryCategoryId}
                onChange={(e) => setSubcategoryCategoryId(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={subcategoryName} onChange={(e) => setSubcategoryName(e.target.value)} />
            </div>
            <Button onClick={createSubcategory} disabled={isPending}>
              <Plus className="h-4 w-4" />
              Add subcategory
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Menu Items</CardTitle>
            <Link href="/menu/new" className={buttonVariants({ variant: "default" })}>
              Create item
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-xl border">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Subcategory</th>
                  <th className="px-3 py-2">Station</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const category = categories.find((c) => c.id === item.category_id);
                  const subcategory = subcategories.find((s) => s.id === item.subcategory_id);

                  return (
                    <tr key={item.id} className="border-t">
                      <td className="px-3 py-2 font-medium">{item.name}</td>
                      <td className="px-3 py-2">{category?.name ?? "-"}</td>
                      <td className="px-3 py-2">{subcategory?.name ?? "-"}</td>
                      <td className="px-3 py-2">{item.prep_station ?? "-"}</td>
                      <td className="px-3 py-2">{formatMoney(Number(item.price))}</td>
                      <td className="px-3 py-2">{item.is_active ? "Active" : "Inactive"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
