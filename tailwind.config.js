/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'apps/dashboard/src/**/*.{html,ts}',
    'libs/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#0f1419',
          elevated: '#1a2129',
          card: '#222c38',
          input: '#1e2730',
        },
        accent: {
          DEFAULT: '#34d399',
          hover: '#2dd4a0',
          dim: 'rgba(52, 211, 153, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(52, 211, 153, 0.08)',
        'glow-md': '0 6px 20px rgba(52, 211, 153, 0.4)',
      },
    },
  },
  plugins: [],
};
