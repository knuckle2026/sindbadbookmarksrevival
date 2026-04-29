"use client";

import { useRouter } from "next/navigation";

interface Props {
  listingId: string;
  title: string;
}

export default function ListingActions({ listingId, title }: Props) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Delete listing "${title}"?`)) return;

    const res = await fetch(`/api/admin/listings/${listingId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const text = await res.text();
      alert(`Error: ${text}`);
      return;
    }

    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      className="rounded bg-red-50 px-3 py-1 text-xs text-red-600 hover:bg-red-100"
    >
      Delete
    </button>
  );
}
