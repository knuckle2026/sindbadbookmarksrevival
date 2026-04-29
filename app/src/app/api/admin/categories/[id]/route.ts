import { NextResponse } from "next/server";
import { checkAdminApi } from "@/lib/auth/guards";
import { deleteCategory, updateCategory } from "@/lib/db/queries/categories";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: auth.status });
  }
  const { id } = await params;
  const body = (await req.json()) as { name?: unknown; slug?: unknown };
  if (typeof body.name !== "string" || typeof body.slug !== "string") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  await updateCategory(id, {
    name: body.name.trim(),
    slug: body.slug.trim(),
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: auth.status });
  }
  const { id } = await params;
  await deleteCategory(id);
  return NextResponse.json({ ok: true });
}
