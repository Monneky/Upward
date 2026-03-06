/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{html,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        'background-soft': 'var(--color-background-soft)',
        'background-mute': 'var(--color-background-mute)',
        'text-primary': 'var(--color-text)',
      },
    },
  },
  plugins: [],
}
