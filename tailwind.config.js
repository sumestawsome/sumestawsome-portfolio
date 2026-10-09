/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Canva Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        semesta: '#5b21b6', // Konversi presisi dari oklch(43.2% 0.232 292.759)
      },
      keyframes: {
        'cascade-down': {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'cascade-icon': 'cascade-down 180ms cubic-bezier(0.16, 1, 0.3, 1) 120ms both',
        'cascade-title': 'cascade-down 180ms cubic-bezier(0.16, 1, 0.3, 1) 170ms both',
        'cascade-price': 'cascade-down 180ms cubic-bezier(0.16, 1, 0.3, 1) 220ms both',
        'cascade-check-1': 'cascade-down 180ms cubic-bezier(0.16, 1, 0.3, 1) 260ms both',
        'cascade-check-2': 'cascade-down 180ms cubic-bezier(0.16, 1, 0.3, 1) 300ms both',
        'cascade-check-3': 'cascade-down 180ms cubic-bezier(0.16, 1, 0.3, 1) 340ms both',
        'cascade-check-4': 'cascade-down 180ms cubic-bezier(0.16, 1, 0.3, 1) 380ms both',
        'cascade-check-5': 'cascade-down 180ms cubic-bezier(0.16, 1, 0.3, 1) 420ms both',
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
      }
    },
  },
  plugins: [],
}