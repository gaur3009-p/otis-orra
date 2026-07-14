// tailwind.config.cjs
/**
 * Tailwind CSS Configuration
 * Uses DaisyUI with a premium dark theme and custom color palette.
 */
module.exports = {
  content: [
    './index.html',
    './apps/**/*.{js,jsx,ts,tsx}',
    './packages/**/*.{js,jsx,ts,tsx}',
    './services/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(220, 70%, 30%)', // deep indigo
        accent: 'hsl(170, 70%, 45%)', // teal accent
        background: 'hsl(230, 20%, 10%)', // dark background
        surface: 'hsla(230, 20%, 12%, 0.85)', // glass surface
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        premium: {
          "primary": "#3b82f6",
          "primary-focus": "#2563eb",
          "primary-content": "#ffffff",
          "secondary": "#10b981",
          "secondary-focus": "#059669",
          "secondary-content": "#ffffff",
          "accent": "#fbbf24",
          "accent-focus": "#f59e0b",
          "accent-content": "#1f2937",
          "neutral": "#1f2937",
          "base-100": "#111827",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
      "dark",
    ],
  },
};
