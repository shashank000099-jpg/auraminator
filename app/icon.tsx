import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};
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
          background: "#000000",
          borderRadius: "6px",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Roof Facets */}
          <path d="M 50 10 L 15 30 L 50 48 Z" fill="#FFFFFF" />
          <path d="M 50 10 L 85 30 L 50 48 Z" fill="#A1A1AA" />
          {/* Left & Right Pillars (A-Legs) */}
          <path d="M 15 30 L 50 48 L 50 90 L 15 70 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="2" />
          <path d="M 85 30 L 50 48 L 50 90 L 85 70 Z" fill="#71717A" stroke="#000000" strokeWidth="2" />
          {/* Inner Notch */}
          <path d="M 50 48 L 38 66 L 50 75 L 62 66 Z" fill="#000000" stroke="#FFFFFF" strokeWidth="2" />
          {/* Outer Border */}
          <path d="M 50 10 L 85 30 L 85 70 L 50 90 L 15 70 L 15 30 Z" fill="none" stroke="#FFFFFF" strokeWidth="4" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
