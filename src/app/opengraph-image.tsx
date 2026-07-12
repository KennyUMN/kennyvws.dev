import { ImageResponse } from "next/og";

export const alt = "Kenny — AI Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          backgroundColor: "#0a0a0b",
          color: "#f5f5f7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 9999,
              backgroundColor: "#409cff",
            }}
          />
          <div style={{ fontSize: 28, color: "#a3a3ad" }}>kennyvws.dev</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -4 }}>
            Kenny
          </div>
          <div style={{ marginTop: 12, fontSize: 36, color: "#a3a3ad" }}>
            AI Engineer — Computer Vision & LLM Systems
          </div>
        </div>
      </div>
    ),
    size
  );
}
