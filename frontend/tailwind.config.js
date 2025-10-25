/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        card: '#141414',
        'card-hover': '#1A1A1A',
        border: '#262626',
        'border-subtle': '#1F1F1F',
        primary: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          light: '#60A5FA',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A1A1A1',
        'text-tertiary': '#737373',
      },
    },
  },
  plugins: [],
}

