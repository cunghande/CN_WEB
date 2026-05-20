/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          50: '#f4fbf8',
          100: '#dff5ea',
          200: '#bdebd5',
          300: '#88d9b8',
          400: '#4fc192',
          500: '#2fa777',
          600: '#21865f',
          700: '#1d6b4f',
          800: '#1a5541',
          900: '#173f32',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
      }
    },
  },
  plugins: [],
};
