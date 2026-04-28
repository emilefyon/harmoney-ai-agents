import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#00005A',
        cyan: '#72ECFF',
        blue: '#6E8CFF',
        purple: {
          DEFAULT: '#C699FE',
          light: '#B1B4FF',
          lighter: '#F1F1FE',
        },
        ink: '#404B7A',
        teal: '#81C9E9',
        sky: '#81BBFF',
        mist: '#ECEDED',
        risk: {
          low: '#5CC563',
          medium: '#FF6717',
          high: '#F75757',
          off: '#ECEDED',
        },
      },
      fontFamily: {
        sans: ['var(--font-archivo)', 'system-ui', 'sans-serif'],
        display: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
