import { getUserContextOrThrow } from "@/lib/auth";

export default async function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await getUserContextOrThrow();
  return <>{children}</>;
}
