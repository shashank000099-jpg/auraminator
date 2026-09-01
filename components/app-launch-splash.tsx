"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Sparkles, Zap } from "lucide-react";

/**
 * Synthesizes a LEGENDARY CINEMATIC "AURA" IMPACT SOUND (Viral Insta / IMAX / Cyberpunk Style)
 * using the Web Audio API without any external MP3 dependencies.
 *
 * Layers:
 * 1. Deep Cinematic "BRAAAM" Sub-Bass Drop (45Hz - 80Hz)
 * 2. Ethereal Atmospheric Resonant Aura Sweep (Hypnotic Whoosh)
 * 3. High-Tier 432Hz/864Hz Solfeggio Crystal Harmonic Chime
 */
function playLegendaryAuraSound() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // -------------------------------------------------------------
    // LAYER 1: CINEMATIC "BRAAAM" & SUB-BASS RUMBLE (Deep Aura Drop)
    // -------------------------------------------------------------
    const subOsc1 = ctx.createOscillator();
    const subOsc2 = ctx.createOscillator();
    const subGain = ctx.createGain();
    const subFilter = ctx.createBiquadFilter();

    // Detuned sawtooth + sine for thick, rich cinema resonance
    subOsc1.type = "sawtooth";
    subOsc2.type = "sine";

    subOsc1.frequency.setValueAtTime(110, now);
    subOsc1.frequency.exponentialRampToValueAtTime(42, now + 0.45); // Pitch drop

    subOsc2.frequency.setValueAtTime(85, now);
    subOsc2.frequency.exponentialRampToValueAtTime(38, now + 0.55);

    // Warm Lowpass Filter
    subFilter.type = "lowpass";
    subFilter.frequency.setValueAtTime(280, now);
    subFilter.frequency.exponentialRampToValueAtTime(75, now + 1.2);
    subFilter.Q.setValueAtTime(5.5, now);

    // Master Sub Envelope
    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.18, now + 0.08); // Punchy initial attack
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

    subOsc1.connect(subFilter);
    subOsc2.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(ctx.destination);

    subOsc1.start(now);
    subOsc2.start(now);
    subOsc1.stop(now + 1.7);
    subOsc2.stop(now + 1.7);

    // -------------------------------------------------------------
    // LAYER 2: ETHEREAL ATMOSPHERIC AURA WHOOSH (Instagram Aesthetic)
    // -------------------------------------------------------------
    const auraOsc = ctx.createOscillator();
    const auraGain = ctx.createGain();
    const auraFilter = ctx.createBiquadFilter();

    auraOsc.type = "triangle";
    auraOsc.frequency.setValueAtTime(160, now);
    auraOsc.frequency.exponentialRampToValueAtTime(432, now + 0.35);
    auraOsc.frequency.exponentialRampToValueAtTime(216, now + 1.0);

    auraFilter.type = "bandpass";
    auraFilter.frequency.setValueAtTime(300, now);
    auraFilter.frequency.exponentialRampToValueAtTime(1400, now + 0.4);
    auraFilter.frequency.exponentialRampToValueAtTime(200, now + 1.3);
    auraFilter.Q.setValueAtTime(4.0, now);

    auraGain.gain.setValueAtTime(0.001, now);
    auraGain.gain.linearRampToValueAtTime(0.12, now + 0.25);
    auraGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

    auraOsc.connect(auraFilter);
    auraFilter.connect(auraGain);
    auraGain.connect(ctx.destination);

    auraOsc.start(now);
    auraOsc.stop(now + 1.6);

    // -------------------------------------------------------------
    // LAYER 3: CELESTIAL CRYSTAL HARMONIC SPARKLE (432Hz / 864Hz)
    // -------------------------------------------------------------
    const chimeOsc1 = ctx.createOscillator();
    const chimeOsc2 = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    const chimeFilter = ctx.createBiquadFilter();

    chimeOsc1.type = "sine";
    chimeOsc2.type = "sine";

    chimeOsc1.frequency.setValueAtTime(432, now + 0.15); // Sacred Solfeggio Aura
    chimeOsc1.frequency.exponentialRampToValueAtTime(864, now + 0.5);

    chimeOsc2.frequency.setValueAtTime(864, now + 0.15);
    chimeOsc2.frequency.exponentialRampToValueAtTime(1728, now + 0.6);

    chimeFilter.type = "lowpass";
    chimeFilter.frequency.setValueAtTime(2600, now + 0.15);

    chimeGain.gain.setValueAtTime(0.001, now + 0.15);
    chimeGain.gain.linearRampToValueAtTime(0.08, now + 0.35);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    chimeOsc1.connect(chimeFilter);
    chimeOsc2.connect(chimeFilter);
    chimeFilter.connect(chimeGain);
    chimeGain.connect(ctx.destination);

    chimeOsc1.start(now + 0.15);
    chimeOsc2.start(now + 0.15);
    chimeOsc1.stop(now + 1.9);
    chimeOsc2.stop(now + 1.9);
  } catch {
    // Fail silently if browser blocks sound autoplay
  }
}

/**
 * Triggers satisfying, legendary haptic drop vibrations on mobile devices
 */
function triggerLegendaryHaptics() {
  try {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      // Powerful triple pulse matching the impact and settle
      navigator.vibrate([35, 45, 60, 30, 20]);
    }
  } catch {}
}

export function AppLaunchSplash() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [animationStage, setAnimationStage] = useState<"initial" | "impact" | "settled">("initial");
  const [progress, setProgress] = useState(10);
  const [statusText, setStatusText] = useState("SYNCHRONIZING AURAMINATOR CORE");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check session persistence so internal routing is instant
    const hasLaunched = sessionStorage.getItem("aura_launched_session");
    if (hasLaunched) {
      setIsVisible(false);
      return;
    }

    // Sound and initial impact trigger
    const soundTimer = setTimeout(() => {
      playLegendaryAuraSound();
      triggerLegendaryHaptics();
      setAnimationStage("impact");
    }, 100);

    // Progress updates
    const p1 = setTimeout(() => {
      setProgress(45);
      setStatusText("VERIFYING ZERO-TRUST VAULT ARCHITECTURE");
    }, 400);

    const p2 = setTimeout(() => {
      setProgress(85);
      setAnimationStage("settled");
      setStatusText("INITIALIZING SOVEREIGN ESCROW PROTOCOL");
    }, 850);

    const p3 = setTimeout(() => {
      setProgress(100);
      setStatusText("AURAMINATOR PROTOCOL ONLINE");
    }, 1300);

    // Fade out and reveal site
    const exitTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1800);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("aura_launched_session", "true");
    }, 2300);

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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black select-none cursor-pointer overflow-hidden transition-all duration-700 ease-out ${
        isFadingOut ? "opacity-0 scale-110 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Dynamic Cyberpunk Brutalist Radial Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18)_0%,rgba(0,0,0,0.85)_55%,#000000_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Radiant Glowing Shockwave Rings Radiating Outward on Impact */}
      {animationStage !== "initial" && (
        <>
          <div className="absolute h-[280px] w-[280px] sm:h-[450px] sm:w-[450px] rounded-full border border-emerald-500/40 animate-ping duration-1000 pointer-events-none" />
          <div className="absolute h-[420px] w-[420px] sm:h-[650px] sm:w-[650px] rounded-full border border-white/20 animate-pulse duration-1000 pointer-events-none" />
          <div className="absolute h-[600px] w-[600px] sm:h-[900px] sm:w-[900px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none animate-pulse" />
        </>
      )}

      {/* Main Core Stage Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full">
        {/* Giant Dynamic 3D Geometric Shield Logo with Zoom-In Momentum */}
        <div
          className={`relative mb-8 transform transition-all duration-700 ease-out ${
            animationStage === "initial"
              ? "scale-50 opacity-0 -translate-y-6"
              : animationStage === "impact"
              ? "scale-125 opacity-100 translate-y-0 filter drop-shadow-[0_0_50px_rgba(16,185,129,0.8)]"
              : "scale-105 opacity-100 translate-y-0 filter drop-shadow-[0_0_35px_rgba(255,255,255,0.5)]"
          }`}
        >
          {/* Volumetric Emerald Aura Halo */}
          <div className="absolute -inset-8 rounded-full bg-emerald-500/25 blur-3xl animate-pulse" />
          <div className="absolute -inset-12 rounded-full bg-white/10 blur-2xl animate-pulse" />

          {/* High-Resolution SVG Geometric Shield */}
          <svg
            width="130"
            height="130"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] sm:w-[150px] sm:h-[150px]"
          >
            <defs>
              <linearGradient id="legTopL" x1="10" y1="28" x2="50" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E4E4E7" />
              </linearGradient>
              <linearGradient id="legTopR" x1="90" y1="28" x2="50" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E4E4E7" />
                <stop offset="100%" stopColor="#71717A" />
              </linearGradient>
              <linearGradient id="legPillarL" x1="10" y1="28" x2="50" y2="94" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="#D4D4D8" />
                <stop offset="100%" stopColor="#A1A1AA" />
              </linearGradient>
              <linearGradient id="legPillarR" x1="90" y1="28" x2="50" y2="94" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="#A1A1AA" />
                <stop offset="100%" stopColor="#71717A" />
              </linearGradient>
              <linearGradient id="legBorderNeon" x1="50" y1="6" x2="50" y2="94" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="#10B981" />
                <stop offset="70%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
            </defs>

            {/* Roof Facets */}
            <path
              d="M 50 6 L 12 28 L 50 48 Z"
              fill="url(#legTopL)"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M 50 6 L 88 28 L 50 48 Z"
              fill="url(#legTopR)"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Main Center Pillars (Forming the Geometric A) */}
            <path
              d="M 12 28 L 50 48 L 50 94 L 12 72 Z"
              fill="url(#legPillarL)"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M 88 28 L 50 48 L 50 94 L 88 72 Z"
              fill="url(#legPillarR)"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Inner Apex Notch */}
            <path
              d="M 50 48 L 36 68 L 50 78 L 64 68 Z"
              fill="#000000"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Radiant Glowing Monolith Outer Hexagonal Perimeter */}
            <path
              d="M 50 6 L 88 28 L 88 72 L 50 94 L 12 72 L 12 28 Z"
              fill="none"
              stroke="url(#legBorderNeon)"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Epic High-Gloss Typography Reveal */}
        <div className="space-y-2 mb-8">
          <h1
            className={`text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 uppercase font-mono tracking-[0.35em] sm:tracking-[0.45em] transition-all duration-700 ${
              animationStage === "initial"
                ? "opacity-0 tracking-normal blur-sm"
                : "opacity-100 blur-0 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
            }`}
          >
            AURAMINATOR
          </h1>
          <p className="text-[11px] sm:text-xs font-mono tracking-[0.25em] sm:tracking-[0.35em] text-emerald-400 uppercase font-bold drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
            SOVEREIGN DIGITAL ASSET &amp; ESCROW PROTOCOL
          </p>
        </div>

        {/* High-Tech System Initialization Progress Engine */}
        <div className="w-full max-w-sm space-y-2.5">
          <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden p-[1px] border border-white/15">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-white to-emerald-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(16,185,129,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono tracking-wider">
            <div className="flex items-center gap-1.5 text-zinc-400 truncate max-w-[240px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{statusText}</span>
            </div>
            <span className="text-emerald-400 font-bold">{progress}%</span>
          </div>
        </div>

        {/* Tap to Skip Prompt */}
        <div className="mt-8 text-[10px] font-mono text-zinc-600 tracking-[0.2em] uppercase animate-pulse">
          TAP ANYWHERE TO BYPASS
        </div>
      </div>
    </div>
  );
}
