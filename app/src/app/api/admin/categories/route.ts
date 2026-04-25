import { NextResponse } from "next/server";
import { checkAdminApi } from "@/lib/auth/guards";
import {
  createCategory,
  reorderCategories,
} from "@/lib/db/queries/categories";

export async function POST(req: Request) {
  const auth = await checkAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: auth.status });
  }
  const body = (await req.json()) as {
    genre_id?: unknown;
    name?: unknown;
    slug?: unknown;
    sort_order?: unknown;
  };
  if (
    typeof body.genre_id !== "string" ||
    typeof body.name !== "string" ||
    typeof body.slug !== "string" ||
    typeof body.sort_order !== "number"
  ) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const row = await createCategory({
    genre_id: body.genre_id,
    name: body.name.trim(),
    slug: body.slug.trim(),
    sort_order: body.sort_order,
  });
  return NextResponse.json(row);
}

export async function PATCH(req: Request) {
  const auth = await checkAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: auth.status });
  }
  const body = (await req.json()) as {
    items?: { id?: unknown; sort_order?: unknown }[];
  };
  if (!Array.isArray(body.items)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const items = body.items.map((it) => {
    if (typeof it.id !== "string" || typeof it.sort_order !== "number") {
      throw new Error("Invalid item");
    }
    return { id: it.id, sort_order: it.sort_order };
  });
  await reorderCategories(items);
  return NextResponse.json({ ok: true });
}
