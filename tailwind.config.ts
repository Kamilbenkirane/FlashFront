import type { Config } from 'tailwindcss';

export default {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}', './src/styles/**/*.css'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
} satisfies Config;
