import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/auth";
import { slugify } from "@/lib/slug";

// Vercel serverless request bodies are capped around 4.5 MB, so server-side
// uploads must stay under that. (Client-direct uploads could lift this later.)
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  // Auth-gated: only the admin may upload (middleware doesn't cover route
  // handlers — same carry-forward rule as the server actions).
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Image uploads aren't configured yet (missing BLOB_READ_WRITE_TOKEN)." },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files can be uploaded." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large (max 4 MB)." }, { status: 400 });
  }

  try {
    const dot = file.name.lastIndexOf(".");
    const base = slugify(dot > 0 ? file.name.slice(0, dot) : file.name);
    const ext = dot > 0 ? file.name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "img";
    const blob = await put(`uploads/${base}.${ext}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[upload] blob put failed:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
