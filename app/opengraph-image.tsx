import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#ffffff",
          color: "#0a0a0a",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2 }}>
          Copycat<span style={{ background: "#ff6a00", padding: "0 16px" }}>Hair</span>
        </div>
        <div style={{ fontSize: 36, marginTop: 24 }}>
          Human hair extensions in 14 shades. 17&Prime; and 22&Prime;.
        </div>
      </div>
    ),
    { ...size },
  );
}
