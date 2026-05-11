/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: '#5e5ce6',
        'brand-soft': '#9d9cf4',
        'brand-light': '#f1f0fc',
        'brand-lighter': '#e3e1f5',
        surface: '#ffffff',
        bg: '#f8f7fc',
        'bg-dark': '#0c0c12',
        'surface-dark': '#161623',
        text: '#1a1a24',
        'text-dark': '#f1f0ff',
        'text-muted': '#656475',
        'text-faint': '#8b8a9f',
        border: '#f0eff6',
        'border-brand': '#e3e1f5',
        'orange-accent': '#e07a5f',
        'orange-bg': '#ffebe0',
        'red-accent': '#ff4d6d',
        'red-light': '#fee2e2',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
};
