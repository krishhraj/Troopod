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
        walnut: {
          50: "#FAF6F3",
          100: "#F0E6DE",
          200: "#DEC8BA",
          300: "#C9A48E",
          400: "#A67C5B",
          500: "#5C4033",
          600: "#4A3228",
          700: "#38261E",
          800: "#271A15",
          900: "#170F0C",
        },
        forest: {
          50: "#EEF4F4",
          100: "#D0E3E3",
          200: "#A3C8C8",
          300: "#72AAAA",
          400: "#3F7E7E",
          500: "#2E4F4F",
          600: "#243F3F",
          700: "#1B2F2F",
          800: "#122020",
          900: "#091010",
        },
        sand: "#F5F5F0",
        amber: {
          cta: "#C8941A",
          light: "#F0B429",
          glow: "#FFD97D",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        shimmer: "shimmer 2s infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        wood: "0 4px 24px rgba(92, 64, 51, 0.15), 0 1px 4px rgba(92, 64, 51, 0.08)",
        "wood-lg": "0 8px 40px rgba(92, 64, 51, 0.2), 0 2px 8px rgba(92, 64, 51, 0.1)",
        "inner-wood": "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(92,64,51,0.1)",
        glow: "0 0 30px rgba(200, 148, 26, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
