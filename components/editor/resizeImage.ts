// Browser-only: downscale + recompress an image before upload to cut bytes.
// Caps the longest edge at maxDim and re-encodes to WebP. Animated GIFs and
// non-images pass through untouched (canvas would flatten a GIF).
export async function downscaleImage(
  file: File,
  maxDim = 1600,
  quality = 0.85,
): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // can't decode — let the server handle/reject it
  }

  const { width, height } = bitmap;
  const scale = Math.min(1, maxDim / Math.max(width, height));

  // Already small in both dimensions and bytes — don't bother re-encoding.
  if (scale >= 1 && file.size < 1_000_000) {
    bitmap.close?.();
    return file;
  }

  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
  if (!blob || blob.size >= file.size) return file; // keep original if no win

  const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], name, { type: "image/webp" });
}
