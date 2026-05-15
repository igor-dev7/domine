/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Voltagent tokens (project design system) ─────────────────────
        primary: {
          DEFAULT: '#2563eb',
          soft: '#3b82f6',
          deep: '#1d4ed8',
          foreground: 'hsl(var(--primary-foreground))',
        },
        'on-primary': '#ffffff',
        ink: {
          DEFAULT: '#f2f2f2',
          strong: '#ffffff',
        },
        body: '#bdbdbd',
        mute: '#8b949e',
        hairline: {
          DEFAULT: '#3d3a39',
          soft: '#b8b3b0',
        },
        canvas: {
          DEFAULT: '#101010',
          soft: '#1a1a1a',
        },

        // ── shadcn semantic tokens via CSS variables ─────────────────────
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        geist: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
      },
    },
  },
  plugins: [],
};
