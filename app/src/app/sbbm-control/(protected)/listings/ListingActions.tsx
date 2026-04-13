"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  listingId: string;
  title: string;
}

export default function ListingActions({ listingId, title }: Props) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Delete listing "${title}"?`)) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId);

    if (error) {
      alert(`Error: ${error.message}`);
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
