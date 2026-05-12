import { NextResponse } from "next/server";
import { incrementAndGetCount } from "@/lib/db/queries/counter";

export async function POST() {
  try {
    const count = await incrementAndGetCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: null }, { status: 500 });
  }
}
