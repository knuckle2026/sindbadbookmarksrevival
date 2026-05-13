import { NextResponse } from "next/server";
import { checkAdminApi } from "@/lib/auth/guards";
import { uploadBannerObject } from "@/lib/supabase/storage";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(req: Request) {
  const auth = await checkAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: auth.status });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const contentType = file.type;
  if (!ALLOWED_MIME.has(contentType)) {
    return NextResponse.json(
      { error: "Unsupported file type" },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const ext = MIME_EXT[contentType] ?? "bin";
  const storageKey = `${y}/${m}/${crypto.randomUUID()}.${ext}`;

  const body = await file.arrayBuffer();
  const result = await uploadBannerObject({
    storageKey,
    contentType,
    body,
  });
  if (!result.ok || !result.publicUrl) {
    return NextResponse.json(
      { error: "Upload failed", detail: result.detail },
      { status: 500 },
    );
  }
  return NextResponse.json({
    storageKey,
    publicUrl: result.publicUrl,
  });
}
