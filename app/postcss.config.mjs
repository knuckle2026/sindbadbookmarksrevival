const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "@csstools/postcss-cascade-layers": {},
    "@csstools/postcss-oklab-function": { preserve: true, subFeatures: { displayP3: false } },
    "@csstools/postcss-color-mix-function": { preserve: true },
  },
};

export default config;
