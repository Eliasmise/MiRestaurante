"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function useRealtimeRefresh({
  restaurantId,
  tables
}: {
  restaurantId: string;
  tables: string[];
}) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channels = tables.map((table) =>
      supabase
        .channel(`table-${table}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table
          },
          () => {
            router.refresh();
          }
        )
        .subscribe()
    );

    const scopedChannel = supabase
      .channel(`restaurant-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`
        },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_items",
          filter: `restaurant_id=eq.${restaurantId}`
        },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      channels.forEach((ch) => {
        supabase.removeChannel(ch);
      });
      supabase.removeChannel(scopedChannel);
    };
  }, [restaurantId, router, tables]);
}
