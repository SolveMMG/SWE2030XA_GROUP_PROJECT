/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#effaf6',
          100: '#d9f3e8',
          200: '#b6e7d1',
          300: '#83d5b2',
          400: '#4bbd8d',
          500: '#269e70',
          600: '#187f59',
          700: '#146647',
          800: '#125139',
          900: '#104331',
        },
        accent: {
          50: '#fff8ed',
          100: '#ffeed5',
          200: '#fdd6a8',
          300: '#fabb72',
          400: '#f69a3c',
          500: '#ed7b1b',
          600: '#d45e11',
        },
        ink: '#17212b',
        muted: '#667085',
        surface: '#ffffff',
        canvas: '#f7f9fc',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 8px 24px rgba(23, 33, 43, 0.08)',
      },
    },
  },
  plugins: [],
};
