import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 180,
  height: 180,
};
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
          background: "#000000",
          borderRadius: "36px",
          border: "2px solid rgba(255,255,255,0.25)",
        }}
      >
        <svg
          width="130"
          height="130"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Roof Facets */}
          <path d="M 50 8 L 14 30 L 50 48 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
          <path d="M 50 8 L 86 30 L 50 48 Z" fill="#D4D4D8" stroke="#000000" strokeWidth="1.5" />
          {/* Left & Right Pillars (A-Legs) */}
          <path d="M 14 30 L 50 48 L 50 92 L 14 70 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.5" />
          <path d="M 86 30 L 50 48 L 50 92 L 86 70 Z" fill="#71717A" stroke="#000000" strokeWidth="1.5" />
          {/* Inner Notch */}
          <path d="M 50 48 L 36 68 L 50 78 L 64 68 Z" fill="#000000" stroke="#FFFFFF" strokeWidth="1.5" />
          {/* Outer Border */}
          <path d="M 50 8 L 86 30 L 86 70 L 50 92 L 14 70 L 14 30 Z" fill="none" stroke="#FFFFFF" strokeWidth="3" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
