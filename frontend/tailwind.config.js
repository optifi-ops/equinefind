/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal:      "#1C1C1E",
        slate:         "#4A4A52",
        mist:          "#F5F4F1",
        border:        "#E8E6E1",
        hunter: {
          DEFAULT:     "#2C4A2E",
          dark:        "#1A2E1B",
          light:       "#EBF0EB",
        },
        gold: {
          DEFAULT:     "#B8973A",
          light:       "#F7F0DC",
        },
        sage: {
          DEFAULT:     "#6B8F71",
          light:       "#EDF3EE",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans:    ["Inter", "-apple-system", "sans-serif"],
      },
      fontSize: {
        xs:   ["0.75rem",  { lineHeight: "1rem" }],
        sm:   ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem",     { lineHeight: "1.5rem" }],
        lg:   ["1.125rem", { lineHeight: "1.75rem" }],
        xl:   ["1.25rem",  { lineHeight: "1.75rem" }],
        "2xl":["1.5rem",   { lineHeight: "2rem" }],
        "3xl":["1.875rem", { lineHeight: "2.25rem" }],
        "4xl":["2.25rem",  { lineHeight: "2.5rem" }],
      },
      borderRadius: {
        DEFAULT: "4px",
        sm: "2px",
        lg: "8px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
