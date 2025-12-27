import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#0f172a",
          steel: "#1e293b",
          cloud: "#e2e8f0",
          highlight: "#38bdf8"
        }
      },
      boxShadow: {
        "soft-xl": "0 20px 70px -24px rgba(15, 23, 42, 0.55)"
      },
      keyframes: {
        floaty: {
          "0%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(0,-18px,0) scale(1.03)" },
          "100%": { transform: "translate3d(0,0,0) scale(1)" }
        }
      },
      animation: {
        floaty: "floaty 16s ease-in-out infinite",
        "floaty-slow": "floaty 20s ease-in-out infinite",
        "floaty-glide": "floaty 24s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
