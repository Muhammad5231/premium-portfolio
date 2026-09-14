import type { Config } from "tailwindcss";

function withOpacity(variableName: string) {
  return `rgb(var(${variableName}) / <alpha-value>)`;
}

function withBorderFallback(cssVar: string, rgbVar: string): any {
  return ({ opacityValue }: { opacityValue?: string }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${rgbVar}) / ${opacityValue})`;
    }
    return `var(${cssVar})`;
  };
}

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: withOpacity("--color-background"),
        foreground: withOpacity("--color-foreground"),
        surface: {
          DEFAULT: withOpacity("--color-surface"),
          subtle: withOpacity("--color-surface-subtle"),
          hover: withOpacity("--color-surface-hover"),
          border: withBorderFallback("--color-surface-border", "--color-border-rgb"),
          "border-strong": withBorderFallback("--color-surface-border-strong", "--color-border-rgb"),
        },
        muted: {
          DEFAULT: withOpacity("--color-muted"),
          foreground: withOpacity("--color-muted-foreground"),
          stone: withOpacity("--color-muted-stone"),
        },
        accent: {
          DEFAULT: withOpacity("--color-accent"),
          hover: withOpacity("--color-accent-hover"),
          muted: withBorderFallback("--color-accent-muted", "--color-accent"),
          border: withBorderFallback("--color-accent-border", "--color-accent"),
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "-apple-system", "sans-serif"],
        display: ["var(--font-display)", "Space Grotesk", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
        editorial: "-0.03em",
        widest: "0.15em",
      },
      lineHeight: {
        tightest: "0.92",
      },
      keyframes: {
        "pulse-subtle": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.92)" },
        },
      },
      animation: {
        "pulse-subtle": "pulse-subtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
