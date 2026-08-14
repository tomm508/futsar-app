import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        'gemini-spin': 'gemini-aurora-spin 14s linear infinite',
        'gemini-float-1': 'gemini-float-1 9s ease-in-out infinite',
        'gemini-float-2': 'gemini-float-2 11s ease-in-out infinite',
        'gemini-pulse': 'gemini-pulse-glow 7s ease-in-out infinite',
      },
      keyframes: {
        'gemini-aurora-spin': {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.15)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        'gemini-float-1': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.65' },
          '33%': { transform: 'translate(25px, -30px) scale(1.18)', opacity: '0.85' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.92)', opacity: '0.55' },
        },
        'gemini-float-2': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.6' },
          '33%': { transform: 'translate(-30px, 20px) scale(1.15)', opacity: '0.8' },
          '66%': { transform: 'translate(20px, -25px) scale(0.88)', opacity: '0.5' },
        },
        'gemini-pulse-glow': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(0.95)' },
          '50%': { opacity: '0.85', transform: 'scale(1.1)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
