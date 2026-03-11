"use client";

import { useMemo, useRef, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { saveFloorLayout } from "@/lib/actions/floor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FloorTable } from "@/lib/types";

interface FloorEditorProps {
  restaurantId: string;
  floor: { id: string; name: string; width: number; height: number };
  initialTables: FloorTable[];
}

export function FloorEditor({ restaurantId, floor, initialTables }: FloorEditorProps) {
  const [tables, setTables] = useState(initialTables);
  const [selectedId, setSelectedId] = useState<string | null>(initialTables[0]?.id ?? null);
  const [saving, setSaving] = useState(false);
  const dragState = useRef<{
    id: string;
    pointerOffsetX: number;
    pointerOffsetY: number;
  } | null>(null);

  const selected = useMemo(
    () => tables.find((table) => table.id === selectedId) ?? null,
    [selectedId, tables]
  );

  function addTable() {
    const tableNumber = tables.length + 1;
    const id = crypto.randomUUID();

    const newTable: FloorTable = {
      id,
      restaurant_id: restaurantId,
      floor_id: floor.id,
      section_id: null,
      table_code: `T${tableNumber}`,
      display_name: `Table ${tableNumber}`,
      shape: tableNumber % 3 === 0 ? "rectangle" : tableNumber % 2 === 0 ? "square" : "circle",
      pos_x: 60 + tableNumber * 16,
      pos_y: 60 + tableNumber * 12,
      width: 104,
      height: tableNumber % 3 === 0 ? 76 : 104,
      seats: 4,
      is_active: true,
      status: "available",
      assigned_waiter_id: null,
      assigned_waiter_name: null
    };

    setTables((current) => [...current, newTable]);
    setSelectedId(id);
  }

  function patchSelected(patch: Partial<FloorTable>) {
    if (!selectedId) return;
    setTables((current) =>
      current.map((table) => (table.id === selectedId ? { ...table, ...patch } : table))
    );
  }

  function removeSelected() {
    if (!selectedId) return;
    setTables((current) => current.filter((table) => table.id !== selectedId));
    setSelectedId((current) => {
      if (!current) return null;
      const next = tables.find((table) => table.id !== current);
      return next?.id ?? null;
    });
  }

  async function onSave() {
    setSaving(true);
    const payload = {
      floorId: floor.id,
      tables: tables.map((table) => ({
        id: table.id,
        restaurant_id: restaurantId,
        floor_id: floor.id,
        section_id: null,
        table_code: table.table_code,
        display_name: table.display_name,
        shape: table.shape,
        pos_x: Math.round(table.pos_x),
        pos_y: Math.round(table.pos_y),
        width: Math.round(table.width),
        height: Math.round(table.height),
        seats: table.seats,
        is_active: table.is_active
      }))
    };

    const result = await saveFloorLayout(payload);
    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Floor layout saved");
  }

  function onPointerDown(event: React.PointerEvent<HTMLButtonElement>, tableId: string) {
    const table = tables.find((item) => item.id === tableId);
    if (!table) return;
    const rect = event.currentTarget.getBoundingClientRect();

    dragState.current = {
      id: tableId,
      pointerOffsetX: event.clientX - rect.left,
      pointerOffsetY: event.clientY - rect.top
    };

    setSelectedId(tableId);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragState.current) return;

    const containerRect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - containerRect.left - dragState.current.pointerOffsetX;
    const y = event.clientY - containerRect.top - dragState.current.pointerOffsetY;

    setTables((current) =>
      current.map((table) =>
        table.id === dragState.current?.id
          ? {
              ...table,
              pos_x: Math.max(0, Math.min(x, floor.width - table.width)),
              pos_y: Math.max(0, Math.min(y, floor.height - table.height))
            }
          : table
      )
    );
  }

  function onPointerUp() {
    dragState.current = null;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{floor.name} Layout</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={addTable}>
                <Plus className="h-4 w-4" />
                Add Table
              </Button>
              <Button onClick={onSave} disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Layout"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="floor-grid overflow-auto rounded-2xl border bg-white p-4">
            <div
              className="relative rounded-xl border border-dashed border-slate-300 bg-slate-50"
              style={{ width: floor.width, height: floor.height }}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              {tables.map((table) => (
                <button
                  key={table.id}
                  onPointerDown={(event) => onPointerDown(event, table.id)}
                  onClick={() => setSelectedId(table.id)}
                  className={cn(
                    "absolute border-2 bg-white text-center text-xs font-medium shadow-sm transition",
                    selectedId === table.id
                      ? "border-primary shadow-lg"
                      : "border-slate-300 hover:border-slate-500",
                    table.shape === "circle" && "rounded-full",
                    table.shape === "square" && "rounded-xl",
                    table.shape === "rectangle" && "rounded-xl"
                  )}
                  style={{
                    left: table.pos_x,
                    top: table.pos_y,
                    width: table.width,
                    height: table.height
                  }}
                >
                  <span className="block text-sm font-semibold">{table.table_code}</span>
                  <span className="text-[11px] text-muted-foreground">{table.display_name}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Table Properties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selected ? (
            <p className="text-sm text-muted-foreground">Select a table to edit.</p>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Table Code</Label>
                <Input
                  value={selected.table_code}
                  onChange={(e) => patchSelected({ table_code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  value={selected.display_name}
                  onChange={(e) => patchSelected({ display_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Shape</Label>
                  <Select
                    value={selected.shape}
                    onChange={(e) =>
                      patchSelected({
                        shape: e.target.value as FloorTable["shape"]
                      })
                    }
                  >
                    <option value="circle">Circle</option>
                    <option value="square">Square</option>
                    <option value="rectangle">Rectangle</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Seats</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={selected.seats}
                    onChange={(e) => patchSelected({ seats: Number(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Width</Label>
                  <Input
                    type="number"
                    min={60}
                    max={320}
                    value={selected.width}
                    onChange={(e) => patchSelected({ width: Number(e.target.value) || 100 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height</Label>
                  <Input
                    type="number"
                    min={60}
                    max={320}
                    value={selected.height}
                    onChange={(e) => patchSelected({ height: Number(e.target.value) || 100 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>X</Label>
                  <Input
                    type="number"
                    value={Math.round(selected.pos_x)}
                    onChange={(e) => patchSelected({ pos_x: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Y</Label>
                  <Input
                    type="number"
                    value={Math.round(selected.pos_y)}
                    onChange={(e) => patchSelected({ pos_y: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <Button variant="destructive" className="w-full" onClick={removeSelected}>
                <Trash2 className="h-4 w-4" />
                Remove Table
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
