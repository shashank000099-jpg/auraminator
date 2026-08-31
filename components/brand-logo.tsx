import React from "react";
import { cn } from "@/lib/utils";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  glow?: boolean;
}

export function AuraminatorIcon({ size = 28, className, glow = false, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0 transition-transform duration-200 group-hover:scale-105", className)}
      {...props}
    >
      <defs>
        {/* Subtle brutalist monochrome lighting gradients */}
        <linearGradient id="auraTopFacet" x1="50" y1="5" x2="50" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E4E4E7" />
        </linearGradient>
        <linearGradient id="auraLeftFacet" x1="10" y1="28" x2="50" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FAFAFA" />
          <stop offset="100%" stopColor="#A1A1AA" />
        </linearGradient>
        <linearGradient id="auraRightFacet" x1="90" y1="28" x2="50" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D4D4D8" />
        </linearGradient>
        <linearGradient id="auraInnerLeft" x1="10" y1="28" x2="50" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F4F4F5" />
        </linearGradient>
        <linearGradient id="auraInnerRight" x1="90" y1="28" x2="50" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E4E4E7" />
          <stop offset="100%" stopColor="#71717A" />
        </linearGradient>
        {glow && (
          <filter id="auraGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>

      {/* Hexagonal Monolith Prism Body */}
      <g filter={glow ? "url(#auraGlow)" : undefined}>
        {/* Top-Left Roof Facet */}
        <path
          d="M 50 6 L 12 28 L 50 48 Z"
          fill="url(#auraInnerLeft)"
          stroke="#000000"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Top-Right Roof Facet */}
        <path
          d="M 50 6 L 88 28 L 50 48 Z"
          fill="url(#auraInnerRight)"
          stroke="#000000"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Main Center-Left Pillar Facet (Forming Left leg of 'A') */}
        <path
          d="M 12 28 L 50 48 L 50 94 L 12 72 Z"
          fill="url(#auraLeftFacet)"
          stroke="#000000"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Main Center-Right Pillar Facet (Forming Right leg of 'A') */}
        <path
          d="M 88 28 L 50 48 L 50 94 L 88 72 Z"
          fill="url(#auraRightFacet)"
          stroke="#000000"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Inner Apex Inset Chasm (Geometric 'A' Crossbar Notch) */}
        <path
          d="M 50 48 L 36 68 L 50 78 L 64 68 Z"
          fill="#000000"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Monolithic Outer Crisp Contour */}
        <path
          d="M 50 6 L 88 28 L 88 72 L 50 94 L 12 72 L 12 28 Z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Center Ridge Crest Line */}
        <line
          x1="50"
          y1="6"
          x2="50"
          y2="48"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="50"
          y1="78"
          x2="50"
          y2="94"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function AuraminatorLogo({
  size = "md",
  showTagline = false,
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
}) {
  const iconSizes = {
    sm: 22,
    md: 28,
    lg: 36,
    xl: 48,
  };

  const textSizes = {
    sm: "text-xs tracking-tight",
    md: "text-sm tracking-tight",
    lg: "text-lg tracking-tight",
    xl: "text-2xl tracking-tighter",
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none group", className)}>
      <AuraminatorIcon size={iconSizes[size]} />
      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span className={cn("font-mono font-extrabold text-white tracking-wider", textSizes[size])}>
            AURAMINATOR
          </span>
          <span className="font-mono text-zinc-500 font-bold text-[0.8em] ml-0.5">.IN</span>
        </div>
        {showTagline && (
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-semibold mt-0.5">
            LUXURY STREETWEAR & DIGITAL VAULT
          </span>
        )}
      </div>
    </div>
  );
}

export function AuraminatorSeal({
  size = 64,
  label = "VERIFIED ESCROW PROTOCOL",
  className,
}: {
  size?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative inline-flex items-center justify-center p-3 rounded-full border border-border bg-surface", className)}>
      <AuraminatorIcon size={size * 0.55} />
      <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse-subtle pointer-events-none" />
    </div>
  );
}

export function AuraminatorWatermark({
  size = 400,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute select-none opacity-[0.03] transition-opacity duration-1000",
        className
      )}
    >
      <AuraminatorIcon size={size} />
    </div>
  );
}
