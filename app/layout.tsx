import type { Metadata } from "next";

import "@/app/globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Mi Restaurante OS",
  description: "Plataforma multi-tenant de operaciones para restaurantes"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
