import { NextResponse } from "next/server";
import { checkAdminApi } from "@/lib/auth/guards";
import { createFaq } from "@/lib/db/queries/faqs";

export async function POST(req: Request) {
  const auth = await checkAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: auth.status });
  }
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
  const row = await createFaq({
    question: body.question.trim(),
    answer: body.answer.trim(),
    sort_order: body.sort_order,
  });
  return NextResponse.json(row);
}
