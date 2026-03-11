import type { Metadata } from "next";

import "@/app/globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Mi Restaurante OS",
  description: "Multi-tenant restaurant operations platform"
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
