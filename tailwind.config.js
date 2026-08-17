/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        clinical: {
          bg: '#0B1220',
          panel: '#121B2E',
          panel2: '#182338',
          border: '#22304A',
          text: '#E6EBF5',
          muted: '#8FA0C0',
          accent: '#3BB2F6',
          teal: '#2FD8C9',
        },
        severity: {
          emergency: '#EF4444',
          urgent: '#F59E0B',
          monitor: '#EAB308',
          normal: '#22C55E',
        }
      },
      fontFamily: {
        display: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
