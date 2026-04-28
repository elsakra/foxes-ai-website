import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F7F4EE",
        "cream-2": "#F0ECE3",
        ink: "#0A0A0A",
        amber: "#C9531E",
        forest: "#1F3B2D",
        rule: "#E8E2D5",
        muted: "#6B6B6B",
        /** Jumper-ish onboarding accents */
        "onboarding-blue": "#2563EB",
        "onboarding-muted": "#E2E8F0",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
};

export default config;
