tailwind.config = {
  theme: {
    extend: {
      colors: {
        canvas: '#F7F5F0',
        surface: '#FFFFFF',
        ink: '#151515',
        muted: '#6F6A63',
        border: '#DDD9D1',
        brand: {
          DEFAULT: '#003D2B',
          deep: '#002E21',
        },
        cream: '#EEE9DF',
        dark: '#111111',
        crimson: '#9E2A2B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      transitionDuration: {
        DEFAULT: '250ms',
        300: '300ms',
        350: '350ms',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
};
