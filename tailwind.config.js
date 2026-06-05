/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#EEEDE7",
          surface: "#FFFFFF",
          ink: "#0E0E0E",
          muted: "#F5F4EF",
        },
        ink: {
          DEFAULT: "#0E0E0E",
          soft: "#3A3A3A",
          muted: "#8A8A8A",
          faint: "#BFBDB5",
        },
        accent: {
          lime: "#DCF26B",
          limeSoft: "#E9F58F",
          mint: "#C2EAD4",
          sky: "#BFE0F2",
          peach: "#F4D9C2",
          rose: "#F2C9CE",
        },
        line: "#E5E2D8",
        good: "#1F8A4C",
        bad: "#D24A3B",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Instrument Serif",
          "ui-serif",
          "Georgia",
          "Cambria",
          "serif",
        ],
      },
      borderRadius: {
        xl2: "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        card: "0 1px 0 rgba(0,0,0,0.04), 0 8px 24px -16px rgba(0,0,0,0.08)",
        soft: "0 2px 12px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
