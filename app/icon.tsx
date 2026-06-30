import { ImageResponse } from "next/og";

// Browser-tab favicon, generated at build (no image asset needed). To use your
// own instead, delete this file and drop a favicon.ico / icon.png in app/.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2563EB",
          color: "#ffffff",
          fontSize: 24,
          fontWeight: 700,
          borderRadius: 7,
        }}
      >
        T
      </div>
    ),
    { ...size },
  );
}
