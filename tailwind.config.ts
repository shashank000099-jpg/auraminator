import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#FFFFFF",
        surface: {
          DEFAULT: "#0A0A0A",
          elevated: "#121214",
          subtle: "#18181B",
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          strong: "rgba(255, 255, 255, 0.16)",
          subtle: "rgba(255, 255, 255, 0.04)",
        },
        muted: {
          DEFAULT: "#71717A",
          foreground: "#A1A1AA",
          dark: "#27272A",
        },
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.03em",
        normal: "-0.01em",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
