export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth check moved to individual pages via getAdminClient()
  // to avoid token refresh issues with separate Supabase clients.
  return <>{children}</>;
}
