/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#000000',
      slate: {
        50: '#F8FAFC',
        200: '#E2E8F0',
        600: '#475569',
        900: '#0F172A',
      },
      primary: '#2C7BE5',
      accent: '#00E5FF',
      success: '#00C853',
      warning: '#FFB300',
      danger: '#D32F2F',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      border: '#E2E8F0',
      text: {
        primary: '#0F172A',
        secondary: '#475569',
      },
    },
    spacing: {
      0: '0px',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      7: '28px',
      8: '32px',
      9: '36px',
      10: '40px',
      11: '44px',
      12: '48px',
      14: '56px',
      16: '64px',
    },
    extend: {
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '20px',
      },
      boxShadow: {
        sm: '0 2px 10px rgba(15, 23, 42, 0.06)',
        md: '0 10px 24px rgba(15, 23, 42, 0.08)',
        lg: '0 18px 40px rgba(15, 23, 42, 0.12)',
      },
      backgroundImage: {
        'card-gradient': 'linear-gradient(135deg, rgba(44, 123, 229, 0.14) 0%, rgba(0, 229, 255, 0.12) 100%)',
        'sidebar-active': 'linear-gradient(120deg, rgba(44, 123, 229, 0.18) 0%, rgba(0, 229, 255, 0.1) 100%)',
        'app-bg': 'radial-gradient(1200px 500px at 90% -10%, rgba(0, 229, 255, 0.11), transparent 65%), radial-gradient(1000px 500px at -5% 0%, rgba(44, 123, 229, 0.08), transparent 70%)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 220ms ease-out',
      },
    },
  },
  plugins: [],
};
