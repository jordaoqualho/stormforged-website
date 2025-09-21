/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ["var(--font-press-start)", "monospace"],
        "pixel-operator": ["var(--font-pixel-operator)", "Courier New", "monospace"],
      },
      colors: {
        // RPG Dark Theme Colors
        darkest: "#0D0D0D",
        darker: "#1A1A1A",
        dark: "#2A2A2A",
        "dark-gray": "#3A3A3A",
        "medium-gray": "#4A4A4A",
        "light-gray": "#6A6A6A",

        // Accent Colors
        gold: "#FFD700",
        "gold-dark": "#B8860B",
        "mystic-blue": "#3A3A75",
        "mystic-blue-light": "#5A5A95",
        success: "#2ECC71",
        "success-dark": "#27AE60",
        danger: "#C83737",
        "danger-dark": "#A52A2A",
        warning: "#F39C12",

        // Text Colors
        "text-primary": "#FFFFFF",
        "text-secondary": "#CCCCCC",
        "text-muted": "#888888",
        "text-disabled": "#555555",

        // Glow Effects
        "glow-gold": "rgba(255, 215, 0, 0.3)",
        "glow-blue": "rgba(58, 58, 117, 0.3)",
        "glow-success": "rgba(46, 204, 113, 0.3)",
        "glow-danger": "rgba(200, 55, 55, 0.3)",
      },
      backgroundImage: {
        battlefield:
          "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYmF0dGxlZmllbGQiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMUEwMDAwIi8+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMkExMDAwIi8+PHJlY3QgeD0iMCIgeT0iMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzMwMjAwMCIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNiYXR0bGVmaWVsZCkiLz48L3N2Zz4=')",
        parchment: "linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)",
        steel: "linear-gradient(135deg, #4A4A4A 0%, #6A6A6A 50%, #4A4A4A 100%)",
        magic: "radial-gradient(circle at center, rgba(58, 58, 117, 0.3) 0%, rgba(13, 13, 13, 0.8) 100%)",
        "gradient-gold": "linear-gradient(to bottom, #FFD700, #B8860B)",
        "gradient-gold-dark": "linear-gradient(to bottom, #B8860B, #8B6914)",
        "gradient-mystic": "linear-gradient(to right, #3A3A75, #5A5A95)",
        "gradient-success": "linear-gradient(to right, #2ECC71, #27AE60)",
        "gradient-danger": "linear-gradient(to right, #C83737, #A52A2A)",
      },
      boxShadow: {
        "glow-gold": "0 0 20px rgba(255, 215, 0, 0.5)",
        "glow-blue": "0 0 20px rgba(58, 58, 117, 0.5)",
        "glow-success": "0 0 20px rgba(46, 204, 113, 0.5)",
        "glow-danger": "0 0 20px rgba(200, 55, 55, 0.5)",
        "inner-glow": "inset 0 0 20px rgba(255, 215, 0, 0.2)",
        pixel: "4px 4px 0px rgba(0, 0, 0, 0.8)",
        "pixel-lg": "8px 8px 0px rgba(0, 0, 0, 0.8)",
      },
      animation: {
        glow: "glow 2s ease-in-out infinite alternate",
        float: "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "pixel-shake": "pixel-shake 0.5s ease-in-out",
        "success-pop": "success-pop 0.6s ease-out",
        "error-shake": "error-shake 0.5s ease-in-out",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(255, 215, 0, 0.5)" },
          "100%": { boxShadow: "0 0 20px rgba(255, 215, 0, 0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 5px rgba(255, 215, 0, 0.3)",
            transform: "scale(1)",
          },
          "50%": {
            boxShadow: "0 0 20px rgba(255, 215, 0, 0.6)",
            transform: "scale(1.02)",
          },
        },
        "pixel-shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-2px)" },
          "75%": { transform: "translateX(2px)" },
        },
        "success-pop": {
          "0%": { transform: "scale(0.8) translateY(20px)", opacity: "0" },
          "50%": { transform: "scale(1.1) translateY(-5px)", opacity: "1" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
        "error-shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-3px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(3px)" },
        },
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      borderRadius: {
        pixel: "4px",
        "pixel-lg": "8px",
      },
    },
  },
  plugins: [],
};
