import type { Config } from "tailwindcss"

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f7f8fb",
        ink: "#202532",
        mist: "#e8edf5",
        seed: "#dff5ed",
        sprout: "#3fb985",
        blueglow: "#8ec8ff",
        violetglow: "#c8b7ff",
      },
      boxShadow: {
        panel: "0 18px 50px rgba(32, 37, 50, 0.08)",
        glow: "0 0 28px rgba(142, 200, 255, 0.24)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config
