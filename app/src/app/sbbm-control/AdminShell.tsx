"use client";

import { usePathname } from "next/navigation";
import { AdminHeader } from "@/components/admin-header";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/sbbm-control/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <AdminHeader />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
