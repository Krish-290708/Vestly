import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        surface: "var(--surface)",
        sunk: "var(--sunk)",
        rule: "var(--rule)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        accent: {
          DEFAULT: "var(--accent)",
          contrast: "var(--accent-contrast)",
        },
        gain: "var(--gain)",
        loss: "var(--loss)",
        warn: "var(--warn)",
        info: "var(--info)",
      },
      fontFamily: {
        sans: ["var(--font-ibm-plex-sans)", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "2px",
        sm: "2px",
        md: "4px",
        lg: "6px",
      },
      boxShadow: {
        popover: "0 4px 12px rgba(0, 0, 0, 0.08)",
        dialog: "0 8px 24px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
