import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: '#00d4ff',
        danger: '#ff4757',
        warning: '#ffa502',
        success: '#2ed573',
        surface: '#0d1117',
        panel: '#161b22',
        border: '#21262d',
        muted: '#8b949e',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
