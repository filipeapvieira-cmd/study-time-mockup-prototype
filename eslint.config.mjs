import nextVitals from "eslint-config-next/core-web-vitals";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "artifacts/**",
      "coverage/**",
      "public/**",
    ],
  },
  ...nextVitals,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      ...jsxA11y.configs.recommended.rules,
      "jsx-a11y/anchor-is-valid": "off",
    },
  },
];
