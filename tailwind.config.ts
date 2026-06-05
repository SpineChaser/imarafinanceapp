import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"]
      },
      colors: {
        primary: "#1D9E75",
        "primary-dark": "#0F6E56",
        "primary-light": "#E1F5EE",
        blue: "#185FA5",
        "blue-light": "#E6F1FB",
        amber: "#BA7517",
        "amber-light": "#FAEEDA",
        danger: "#A32D2D",
        "danger-light": "#FCEBEB",
        surface: "#FFFFFF",
        "surface-secondary": "#F7F8FA",
        border: "rgba(0,0,0,0.08)",
        ink: "#0F1117",
        muted: "#6B7280"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 17, 23, 0.07)"
      },
      borderRadius: {
        input: "8px",
        card: "12px",
        panel: "16px"
      }
    }
  },
  plugins: []
} satisfies Config;
