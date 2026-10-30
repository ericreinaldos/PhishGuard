/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: { DEFAULT: token('surface'), 2: token('surface-2'), 3: token('surface-3') },
        line: { DEFAULT: token('line'), strong: token('line-strong') },
        fg: token('fg'),
        muted: token('muted'),
        subtle: token('subtle'),
        accent: {
          // Texto, iconos y marcas sobre fondo oscuro (contraste AA)
          DEFAULT: token('accent'),
          // Rellenos de botones y titulares grandes: el azul del diseño de Figma
          strong: token('accent-strong'),
          deep: token('accent-deep'),
          ink: token('accent-ink'),
        },
        danger: token('danger'),
        warning: token('warning'),
        safe: token('safe'),
        info: token('info'),
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', 'Segoe UI', 'sans-serif'],
        display: ['Archivo', 'system-ui', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      // Radios contenidos: se redefinen las clases existentes para que toda la app los herede
      borderRadius: {
        md: 'var(--radius-xs)',
        lg: 'var(--radius-sm)',
        xl: 'var(--radius-md)',
        '2xl': 'var(--radius-lg)',
        '3xl': 'var(--radius-lg)',
      },
      spacing: {
        section: 'var(--space-section)',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
      },
      boxShadow: {
        card: 'none',
        glow: '0 0 0 1px rgb(var(--accent-strong) / 0.55)',
        pop: '0 12px 32px -16px rgb(0 0 0 / 0.7)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scroll-cue': {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'top' },
          '45%': { transform: 'scaleY(1)', transformOrigin: 'top' },
          '55%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(0)', transformOrigin: 'bottom' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s var(--ease-out) both',
        'scroll-cue': 'scroll-cue 2.4s var(--ease-out) infinite',
      },
    },
  },
  plugins: [],
};
