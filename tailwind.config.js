/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{html,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        norte: {
          bg: '#0a0a0a',
          card: '#111111',
          border: '#1a1a1a',
          text: '#F0EAD6',
          muted: '#8a8578',
          primary: '#E63946',
          primaryHover: '#FF6B6B'
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Playfair Display', 'serif']
      },
      borderRadius: {
        card: '12px'
      }
    },
  },
  plugins: [],
}
