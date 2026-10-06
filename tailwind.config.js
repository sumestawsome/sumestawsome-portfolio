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
        primary: {
          DEFAULT: '#5b21b6', // Menjadi class "bg-primary" atau "text-primary" (violet-800)
          hover: '#4c1d95',   // Menjadi class "hover:bg-primary-hover" (violet-900)
          light: '#ede9fe',   // Menjadi class "bg-primary-light" (violet-100)
        }
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
      }
    },
  },
  plugins: [],
}