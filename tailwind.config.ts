import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0F',
        midnight: '#0D1117',
        charcoal: '#1C1C1E',
        silver: '#C0C0C0',
        steel: '#8B8B8D',
        ghost: '#F5F5F5',
        sapphire: '#2563EB',
        emerald: '#059669',
        ruby: '#DC2626',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      maxWidth: {
        '7xl': '80rem',
        prose: '65ch',
      },
      gridTemplateColumns: {
        '12': 'repeat(12, minmax(0, 1fr))',
      },
      lineHeight: {
        'relaxed': '1.8',
      },
      borderColor: {
        DEFAULT: '#C0C0C0',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
