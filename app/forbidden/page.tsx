import Link from "next/link";
import { headers } from "next/headers";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { l, localeOrDefault } from "@/lib/i18n";

export default async function ForbiddenPage() {
  const headerList = await headers();
  const acceptLanguage = headerList.get("accept-language");
  const locale = localeOrDefault(acceptLanguage?.toLowerCase().startsWith("es") ? "es" : "en");

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{l(locale, "Access Denied", "Acceso denegado")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {l(locale, "Your account does not have permission for this screen.", "Tu cuenta no tiene permiso para esta pantalla.")}
          </p>
          <Link href="/dashboard" className={buttonVariants({ variant: "default" })}>
            {l(locale, "Return to dashboard", "Volver al panel")}
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
