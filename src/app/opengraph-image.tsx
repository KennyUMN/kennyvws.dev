import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const alt = "Kenny · AI Engineer";
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
          padding: 72,
          backgroundColor: "#0e0e0d",
          color: "#ededE8",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>{site.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#aaaaa3" }}>
            <div style={{ width: 14, height: 14, backgroundColor: "#ff6a2f" }} />
            {site.url.replace(/^https?:\/\//, "")}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 26, color: "#aaaaa3" }}>{site.role}</div>
          <div style={{ fontSize: 64, fontWeight: 600, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>
            {site.pitch}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
