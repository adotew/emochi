import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        surfaceStrong: "hsl(var(--surface-strong))",
        primary: "hsl(var(--primary))",
        accent: "hsl(var(--accent))",
        text: "hsl(var(--text))",
        muted: "hsl(var(--muted))",
        success: "hsl(var(--success))",
        danger: "hsl(var(--danger))",
      },
      boxShadow: {
        glow: "0 30px 80px rgba(15, 23, 42, 0.35)",
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        pulseRing: "pulseRing 1.4s ease-out infinite",
        bounceSoft: "bounceSoft 0.8s ease",
        fadeSlide: "fadeSlide 0.45s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.94)", opacity: "0.6" },
          "100%": { transform: "scale(1.06)", opacity: "0" },
        },
        bounceSoft: {
          "0%": { transform: "scale(0.96)" },
          "60%": { transform: "scale(1.04)" },
          "100%": { transform: "scale(1)" },
        },
        fadeSlide: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
