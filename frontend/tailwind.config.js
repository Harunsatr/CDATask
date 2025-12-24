import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#fdf8f1',
        charcoal: '#1d1d1b',
        platinum: '#e5dfd5',
        gold: '#b0904f',
      },
      fontFamily: {
        sans: ['"General Sans"', ...fontFamily.sans],
      },
      boxShadow: {
        card: '0 40px 80px rgba(29, 29, 27, 0.08)',
      },
    },
  },
  plugins: [],
};
