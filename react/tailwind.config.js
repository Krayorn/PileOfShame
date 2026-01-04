/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Rajdhani"', '"Orbitron"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'terminal': '0 0 8px rgba(0, 255, 65, 0.3), 0 0 2px rgba(0, 255, 65, 0.5)',
        'terminal-glow': '0 0 12px rgba(0, 255, 65, 0.4), 0 0 4px rgba(0, 255, 65, 0.6)',
      },
    },
  },
  plugins: [],
}

