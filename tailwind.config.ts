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
        // مستخرجة من صورة مبنى الإمارة (K-Means) — راجع ملف التسليم قسم 3
        primary: {
          DEFAULT: "#1F5C33",
          dark: "#123D22",
        },
        secondary: {
          DEFAULT: "#D8CDB4",
        },
        accent: {
          DEFAULT: "#7FB8DE",
        },
        neutral: {
          dark: "#3A3D36",
          gray: "#8A8880",
        },
        surface: "#F7F5F0",
        success: "#4C7A32",
        warning: "#B98A3C",
        danger: "#A6482F",
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(58,61,54,0.04), 0 8px 24px -12px rgba(58,61,54,0.15)",
        float: "0 12px 40px -12px rgba(18,61,34,0.35)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "typing-bounce": {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "typing-bounce": "typing-bounce 1.4s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
