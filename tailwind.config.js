/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', // toggle later by adding 'dark' class to <html>; clinical.* tokens below are reserved for that mode
  theme: {
    extend: {
      colors: {
        // ---- Light pastel theme (default) ----
        cream: {
          bg: '#F7F3EC',        // warm cream page background
          mint: '#E8F3EE',      // mint-tinted gradient top
          card: '#FFFFFF',      // card surface
          border: '#EDE6D9',
        },
        ink: {
          DEFAULT: '#1F2A37',   // primary body text (light bg)
          muted: '#6B7685',     // secondary text
          soft: '#94A0AF',      // tertiary / placeholder
        },
        module: {
          // per-module accent colors — used for card left-border/icon bg/
          // active nav/primary buttons/badges within that module only.
          pregnancy: '#3FA79A',       // teal
          pregnancyBg: '#E3F3EF',
          period: '#E8879C',          // soft pink
          periodBg: '#FBE9EE',
          emergency: '#EF7A62',       // coral — reserved for urgent/attention
          emergencyBg: '#FDECE7',
          neutral: '#8A93A6',         // home/settings/account
          neutralBg: '#F0EEE8',
        },
        // ---- Legacy alias: existing components reference clinical-* classes.
        // These now resolve to light-pastel-appropriate values so the whole
        // app renders correctly in the new theme without editing every file.
        // (The real dark palette is preserved separately for the future
        // dark-mode toggle — see clinicalDark below.)
        clinical: {
          bg: '#F7F3EC',
          panel: '#FFFFFF',
          panel2: '#F3EFE7',
          border: '#EDE6D9',
          text: '#1F2A37',
          muted: '#6B7685',
          accent: '#3FA79A',
          teal: '#3FA79A',
        },
        // ---- Dark clinical theme (reserved for future dark-mode toggle) ----
        clinicalDark: {
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
        // heading font distinct from body, per spec item 6 — warm serif-ish display face
        display: ['"Fraunces"', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      spacing: {
        'card-gap': '1.25rem', // bumped from default 1rem gap between stacked cards
      },
      borderRadius: {
        'card': '1rem',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'pulse-confirm': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.15)', opacity: '0.6' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'milestone-glow': {
          '0%': { boxShadow: '0 0 0 0 rgba(63,167,154,0.0)' },
          '30%': { boxShadow: '0 0 24px 6px rgba(63,167,154,0.35)' },
          '100%': { boxShadow: '0 0 0 0 rgba(63,167,154,0.0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s linear infinite',
        'pulse-confirm': 'pulse-confirm 300ms ease',
        'milestone-glow': 'milestone-glow 2.2s ease',
      },
      transitionDuration: {
        150: '150ms',
      },
    },
  },
  plugins: [],
}
