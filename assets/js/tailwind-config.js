// Shared Tailwind configuration for the project
// This file must be included BEFORE the Tailwind CDN script in HTML files.
window.tailwind = window.tailwind || {};
window.tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#10a24b",
        "primary-dark": "#0d8a3f",
        "background-light": "#f6f8f7",
        "background-dark": "#112117",
        accent: "#e7f3ec",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
    },
  },
};
