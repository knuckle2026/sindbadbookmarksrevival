import { NextResponse } from "next/server";
import { checkAdminApi } from "@/lib/auth/guards";
import { deleteFaq, updateFaq } from "@/lib/db/queries/faqs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: auth.status });
  }
  const { id } = await params;
  const body = (await req.json()) as {
    question?: unknown;
    answer?: unknown;
    sort_order?: unknown;
  };
  if (
    typeof body.question !== "string" ||
    typeof body.answer !== "string" ||
    typeof body.sort_order !== "number"
  ) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  await updateFaq(id, {
    question: body.question.trim(),
    answer: body.answer.trim(),
    sort_order: body.sort_order,
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
  await deleteFaq(id);
  return NextResponse.json({ ok: true });
}
