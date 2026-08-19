/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        maternal: {
          primary: '#E85A91',    // Vibrant Rose Pink
          hover: '#D4437B',      // Darker rose hover
          soft: '#F7D7E4',       // Soft pink
          blush: '#FFF5F8',      // Very pale blush background
          card: '#FFFFFF',       // Card background
          border: '#FCE7F3',     // Soft pink border
          text: '#0F172A',       // Dark slate text (high contrast)
          muted: '#475569',      // Slate-600 muted text
        },
        clinical: {
          bg: '#FFF5F8',       // Soft blush background
          panel: '#FFFFFF',    // White card background
          panel2: '#FFF0F5',   // Secondary panel background
          border: '#FCE7F3',   // Border color
          text: '#0F172A',     // High contrast dark text
          muted: '#475569',    // High contrast muted text
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
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
