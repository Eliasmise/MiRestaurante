import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNowStrict } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

export function minutesAgo(date: string | null): string {
  if (!date) return "-";
  return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
}

export function toNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
