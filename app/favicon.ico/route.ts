import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="20" fill="#000000"/>
  <defs>
    <linearGradient id="favTopL" x1="10" y1="28" x2="50" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E4E4E7"/>
    </linearGradient>
    <linearGradient id="favTopR" x1="90" y1="28" x2="50" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E4E4E7"/>
      <stop offset="100%" stop-color="#71717A"/>
    </linearGradient>
    <linearGradient id="favLegL" x1="10" y1="28" x2="50" y2="92" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#A1A1AA"/>
    </linearGradient>
    <linearGradient id="favLegR" x1="90" y1="28" x2="50" y2="92" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#D4D4D8"/>
    </linearGradient>
  </defs>
  <path d="M 50 10 L 15 30 L 50 48 Z" fill="url(#favTopL)" stroke="#000000" stroke-width="1.5"/>
  <path d="M 50 10 L 85 30 L 50 48 Z" fill="url(#favTopR)" stroke="#000000" stroke-width="1.5"/>
  <path d="M 15 30 L 50 48 L 50 90 L 15 70 Z" fill="url(#favLegL)" stroke="#000000" stroke-width="1.5"/>
  <path d="M 85 30 L 50 48 L 50 90 L 85 70 Z" fill="url(#favLegR)" stroke="#000000" stroke-width="1.5"/>
  <path d="M 50 48 L 38 66 L 50 75 L 62 66 Z" fill="#000000" stroke="#FFFFFF" stroke-width="1"/>
  <path d="M 50 10 L 85 30 L 85 70 L 50 90 L 15 70 L 15 30 Z" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
