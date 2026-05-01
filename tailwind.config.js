/** @type {import('tailwindcss').Config} */
export default {
  content: ["./*.html", "./src/**/*.{js,jsx}"],
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
        "onboarding-blue": "#2563EB",
        "onboarding-muted": "#E2E8F0",
      },
      fontFamily: {
        display: ["Fraunces Variable", "Fraunces", "Georgia", "serif"],
        sans: ["Inter Variable", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
