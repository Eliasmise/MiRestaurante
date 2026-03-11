import { redirect } from "next/navigation";

import { getUserContextOrThrow, roleHome } from "@/lib/auth";

export default async function HomePage() {
  const context = await getUserContextOrThrow();
  redirect(roleHome(context.role));
}
