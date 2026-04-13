"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/sbbm-control", label: "Dashboard" },
  { href: "/sbbm-control/categories", label: "Categories" },
  { href: "/sbbm-control/listings", label: "Listings" },
];

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sbbm-control/login");
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 text-white">
      {/* Left: title + nav */}
      <div className="flex items-center gap-6">
        <Link href="/sbbm-control" className="text-base font-bold tracking-tight">
          SBBM Control
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/sbbm-control"
                ? pathname === "/sbbm-control"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: logout */}
      <button
        onClick={handleLogout}
        className="rounded px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
      >
        Logout
      </button>
    </header>
  );
}
