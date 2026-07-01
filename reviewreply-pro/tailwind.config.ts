import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium SaaS palette: light surface, charcoal ink, muted bronze accent.
        charcoal: {
          DEFAULT: "#1f2328",
          soft: "#3a4048",
          muted: "#6b7280",
        },
        bronze: {
          DEFAULT: "#a8763e",
          soft: "#c79a5c",
          faint: "#f4ecdf",
        },
        surface: {
          DEFAULT: "#ffffff",
          sunken: "#f7f6f3",
          border: "#e7e3db",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(31,35,40,0.04), 0 8px 24px rgba(31,35,40,0.06)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
