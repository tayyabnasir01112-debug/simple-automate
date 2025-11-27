import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
          light: '#bfdbfe',
        },
        slate: {
          950: '#020617',
        },
      },
      boxShadow: {
        card: '0 15px 35px rgba(15,23,42,0.08)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

export default config;

