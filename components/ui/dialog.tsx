"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, title, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-3 md:items-center">
      <div className="absolute inset-0" onClick={() => onOpenChange(false)} />
      <div
        className={cn(
          "relative z-10 w-full max-w-xl rise-in rounded-2xl border border-white/70 bg-card/95 p-5 shadow-luxe"
        )}
      >
        <h2 className="mb-4 text-lg font-semibold tracking-tight">{title}</h2>
        {children}
      </div>
    </div>
  );
}
