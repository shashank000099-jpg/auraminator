"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Sparkles } from "lucide-react";

/**
 * Synthesizes an ultra-subtle, aesthetic, low-volume cinematic sub-bass pulse
 * and crystal harmonic chime using the Web Audio API without external files.
 */
function playAestheticLaunchSound() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // 1. Soft Sub-bass Warm Swell (55Hz -> 110Hz)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(55, now);
    subOsc.frequency.exponentialRampToValueAtTime(110, now + 0.6);

    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.06, now + 0.2); // Low aesthetic volume (6%)
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    subOsc.start(now);
    subOsc.stop(now + 1.3);

    // 2. Crystal Shimmer Chime (528Hz Solfeggio / 1056Hz harmonic)
    const chimeOsc = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    chimeOsc.type = "triangle";
    chimeOsc.frequency.setValueAtTime(528, now + 0.1);
    chimeOsc.frequency.exponentialRampToValueAtTime(1056, now + 0.7);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800, now);

    chimeGain.gain.setValueAtTime(0.001, now + 0.1);
    chimeGain.gain.linearRampToValueAtTime(0.04, now + 0.3); // Low aesthetic volume (4%)
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

    chimeOsc.connect(filter);
    filter.connect(chimeGain);
    chimeGain.connect(ctx.destination);

    chimeOsc.start(now + 0.1);
    chimeOsc.stop(now + 1.5);
  } catch {
    // Fail silently if browser blocks audio autoplay
  }
}

/**
 * Triggers subtle haptic vibration feedback on supported mobile devices
 */
function triggerHapticPulse() {
  try {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([25, 35, 20]);
    }
  } catch {}
}

export function AppLaunchSplash() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState("INITIALIZING SECURE ESCROW ENCLAVE");

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    // Check if splash was already shown in this tab session
    const hasLaunched = sessionStorage.getItem("aura_launched_session");
    if (hasLaunched) {
      setIsVisible(false);
      return;
    }

    // Play subtle aesthetic sound and trigger haptic pulse
    const soundTimer = setTimeout(() => {
      playAestheticLaunchSound();
      triggerHapticPulse();
    }, 150);

    // Progress animation sequence
    const p1 = setTimeout(() => {
      setProgress(48);
      setStatusText("VERIFYING ZERO-TRUST VAULT ARCHITECTURE");
    }, 450);

    const p2 = setTimeout(() => {
      setProgress(85);
      setStatusText("ESTABLISHING SPLIT COMMERCE PROTOCOL");
    }, 900);

    const p3 = setTimeout(() => {
      setProgress(100);
      setStatusText("AURAMINATOR PROTOCOL ONLINE");
    }, 1300);

    // Fade out trigger
    const exitTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1650);

    // Unmount and persist session flag
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("aura_launched_session", "true");
    }, 2100);

    return () => {
      clearTimeout(soundTimer);
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(p3);
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const handleFastSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("aura_launched_session", "true");
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={handleFastSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black select-none cursor-pointer transition-all duration-500 ease-out ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 45%, rgba(16, 185, 129, 0.08) 0%, transparent 60%),
          radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 70%)
        `,
      }}
    >
      {/* Background Micro Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Main Core Animation Center */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full">
        {/* Animated Geometric Shield Logo */}
        <div className="relative mb-6">
          {/* Ambient Luminescent Pulse Glow */}
          <div className="absolute -inset-4 rounded-full bg-white/10 blur-xl animate-pulse" />
          <div className="absolute -inset-6 rounded-full bg-emerald-500/15 blur-2xl animate-pulse" />

          {/* 3D Geometric Shield Vector */}
          <div className="relative transform transition-transform duration-700 hover:scale-105">
            <svg
              width="88"
              height="88"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] animate-in zoom-in-75 duration-700"
            >
              <defs>
                <linearGradient id="splashRoofL" x1="10" y1="28" x2="50" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#E4E4E7" />
                </linearGradient>
                <linearGradient id="splashRoofR" x1="90" y1="28" x2="50" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#E4E4E7" />
                  <stop offset="100%" stopColor="#71717A" />
                </linearGradient>
                <linearGradient id="splashLegL" x1="10" y1="28" x2="50" y2="94" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FAFAFA" />
                  <stop offset="100%" stopColor="#A1A1AA" />
                </linearGradient>
                <linearGradient id="splashLegR" x1="90" y1="28" x2="50" y2="94" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#D4D4D8" />
                </linearGradient>
                <linearGradient id="splashBorder" x1="50" y1="6" x2="50" y2="94" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#FFFFFF" />
                </linearGradient>
              </defs>

              {/* Roof Facets */}
              <path
                d="M 50 6 L 12 28 L 50 48 Z"
                fill="url(#splashRoofL)"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M 50 6 L 88 28 L 50 48 Z"
                fill="url(#splashRoofR)"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />

              {/* Main Pillars */}
              <path
                d="M 12 28 L 50 48 L 50 94 L 12 72 Z"
                fill="url(#splashLegL)"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M 88 28 L 50 48 L 50 94 L 88 72 Z"
                fill="url(#splashLegR)"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />

              {/* Inner Apex Notch */}
              <path
                d="M 50 48 L 36 68 L 50 78 L 64 68 Z"
                fill="#000000"
                stroke="#FFFFFF"
                strokeWidth="1"
                strokeLinejoin="round"
              />

              {/* Glowing Outer Hexagonal Perimeter */}
              <path
                d="M 50 6 L 88 28 L 88 72 L 50 94 L 12 72 L 12 28 Z"
                fill="none"
                stroke="url(#splashBorder)"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Wordmark & Brand Title with Tracking Reveal */}
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-[0.25em] sm:tracking-[0.35em] text-white uppercase font-mono animate-in fade-in slide-in-from-bottom-2 duration-500">
            AURAMINATOR
          </h1>
          <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 uppercase font-semibold">
            SOVEREIGN DIGITAL ASSET &amp; COMMERCE PROTOCOL
          </p>
        </div>

        {/* High-Tech Initialization Progress Bar */}
        <div className="w-full max-w-xs space-y-2">
          <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden p-[1px] border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-white to-emerald-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 tracking-wider">
            <span className="truncate max-w-[200px]">{statusText}</span>
            <span className="text-emerald-400 font-bold">{progress}%</span>
          </div>
        </div>

        {/* Tap to Skip Prompt */}
        <div className="mt-8 text-[9px] font-mono text-zinc-600 tracking-widest uppercase animate-pulse">
          TAP ANYWHERE TO ENTER
        </div>
      </div>
    </div>
  );
}
