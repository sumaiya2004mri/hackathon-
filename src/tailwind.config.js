/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        maternal: {
          primary: '#E85A91',    // Rose pink primary
          hover: '#D4437B',      // Darker rose hover
          soft: '#F7D7E4',       // Soft pink
          blush: '#FFF5F8',      // Very pale blush background
          card: '#FFFFFF',       // Card background
          border: '#FCE7F3',     // Soft pink border
          text: '#26324A',       // Dark text
          muted: '#667085',      // Muted text
        },
        clinical: {
          bg: '#FFF5F8',       // Soft blush background
          panel: '#FFFFFF',    // White card background
          panel2: '#FFF0F5',   // Secondary panel background (blush)
          border: '#FCE7F3',   // Border color (soft pink)
          text: '#26324A',     // Text color
          muted: '#667085',    // Muted text
          accent: '#E85A91',   // Rose accent
          teal: '#0D9488',
        },
        pregnancy: {
          accent: '#E85A91',
          bg: '#FFF5F8',
          border: '#FCE7F3',
        },
        period: {
          accent: '#DB2777',
          bg: '#FDF2F8',
          border: '#FCE7F3',
        },
        triage: {
          accent: '#E11D48',
          bg: '#FFF1F2',
          border: '#FFE4E6',
        },
        severity: {
          emergency: '#E11D48',
          urgent: '#EA580C',
          monitor: '#D97706',
          normal: '#16A34A',
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
