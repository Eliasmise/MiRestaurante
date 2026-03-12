import type { UserRole } from "@/lib/types";

export type Locale = "en" | "es";

export function localeOrDefault(value: string | null | undefined): Locale {
  return value === "es" ? "es" : "en";
}

export function l(locale: Locale, en: string, es: string) {
  return locale === "es" ? es : en;
}

export function roleLabel(locale: Locale, role: UserRole) {
  const map: Record<UserRole, { en: string; es: string }> = {
    super_admin: { en: "Super admin", es: "Superadmin" },
    manager: { en: "Manager", es: "Gerente" },
    waiter: { en: "Waiter", es: "Mesero" },
    kitchen: { en: "Kitchen", es: "Cocina" },
    cashier: { en: "Cashier", es: "Cajero" }
  };

  return l(locale, map[role].en, map[role].es);
}

export function tableStatusLabel(locale: Locale, status: string) {
  const map: Record<string, { en: string; es: string }> = {
    available: { en: "Available", es: "Disponible" },
    occupied: { en: "Occupied", es: "Ocupada" },
    ordering: { en: "Ordering", es: "Tomando pedido" },
    sent_to_kitchen: { en: "Sent", es: "Enviado" },
    in_preparation: { en: "In prep", es: "En preparación" },
    ready: { en: "Ready", es: "Listo" },
    needs_payment: { en: "Payment", es: "Cobro" },
    closed: { en: "Closed", es: "Cerrada" },
    draft: { en: "Draft", es: "Borrador" },
    submitted: { en: "Submitted", es: "Enviado" },
    served: { en: "Served", es: "Servido" },
    cancelled: { en: "Cancelled", es: "Cancelado" },
    preparing: { en: "Preparing", es: "Preparando" },
    voided: { en: "Voided", es: "Anulado" }
  };

  return map[status] ? l(locale, map[status].en, map[status].es) : status;
}
