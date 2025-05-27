/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Dark mode sınıf tabanlı
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        'napoli-blue': 'var(--napoli-blue)',
        'navy-color': 'var(--navy-color)',
        'navy-color-alt': 'var(--navy-color-alt)',
        'theme-primary': 'var(--theme-primary)',
        'theme-primary-light': 'var(--theme-primary-light)',
      },
    },
  },
  corePlugins: {
    preflight: true, // Tailwind'in varsayılan stillerini etkinleştir
  },
  plugins: [],
  important: false, // Important'ı kaldır çünkü preflight ile çakışabilir
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
} 