/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        clinical: {
          bg: '#FAF8F5',       // Cream background
          panel: '#FFFFFF',    // White card background
          panel2: '#F4F1EA',   // Secondary panel background (warm cream-gray)
          border: '#E8E4DC',   // Border color (soft warm gray)
          text: '#1E293B',     // Text color (slate-800)
          muted: '#52627A',    // Muted text (warm slate-600, WCAG AA contrast compliant)
          accent: '#4B5563',   // Neutral UI (gray)
          teal: '#0D9488',     // Pregnancy teal
        },
        pregnancy: {
          accent: '#0D9488',
          bg: '#F0FDFA',
          border: '#CCFBF1',
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
          emergency: '#E11D48', // Coral
          urgent: '#EA580C',    // Dark orange (more readable on light backgrounds)
          monitor: '#D97706',   // Dark amber (more readable on light backgrounds)
          normal: '#16A34A',    // Green
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
