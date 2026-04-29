import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return <>{children}</>;
}
