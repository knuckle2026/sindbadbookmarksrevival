import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ListingForm from "./ListingForm";

export default async function NewListingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/listings/new");
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, group_type, name")
    .order("sort_order");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">情報を登録する</h1>
      <ListingForm categories={categories ?? []} />
    </div>
  );
}
