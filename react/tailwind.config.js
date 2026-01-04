/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Rajdhani"', '"Orbitron"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Warhammer Terminal Colors
        terminal: {
          bg: '#0a0f0a',        // Very dark green/black background
          bgLight: '#0f1a0f',   // Slightly lighter dark green
          fg: '#00ff41',        // Bright green text
          fgDim: '#00cc33',     // Dimmer green for secondary text
          accent: '#aaff00',    // Yellow-green for highlights
          border: '#00ff41',    // Green borders
          borderDim: '#00cc33', // Dimmer green borders
          warning: '#ffaa00',   // Yellow for warnings
          destructive: '#ff3333', // Red for destructive actions
          painted: '#00ff41',   // Green for painted status
          built: '#ffaa00',      // Yellow for built status
          gray: '#888888',       // Gray for gray status
        },
      },
      boxShadow: {
        'terminal': '0 0 8px rgba(0, 255, 65, 0.3), 0 0 2px rgba(0, 255, 65, 0.5)',
        'terminal-glow': '0 0 12px rgba(0, 255, 65, 0.4), 0 0 4px rgba(0, 255, 65, 0.6)',
      },
    },
  },
  plugins: [],
}

