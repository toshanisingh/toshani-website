import { ImageResponse } from "next/og";

// Icon used when someone adds the site to an iOS/macOS home screen.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 120,
          fontWeight: 700,
        }}
      >
        T
      </div>
    ),
    { ...size },
  );
}
