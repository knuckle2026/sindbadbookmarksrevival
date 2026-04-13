import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-bold text-zinc-900">SBBM Control Panel</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/sbbm-control/categories"
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-zinc-900">Categories</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Manage categories for each genre
          </p>
        </Link>

        <Link
          href="/sbbm-control/listings"
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-zinc-900">Listings</h2>
          <p className="mt-1 text-sm text-zinc-500">
            View, edit, and manage all listings
          </p>
        </Link>
      </div>
    </div>
  );
}
