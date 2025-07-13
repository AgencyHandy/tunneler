import tseslint from "typescript-eslint";

export default [
  // TypeScript support
  ...tseslint.config({
    files: ["**/*.ts"],
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  }),

  // Prettier integration
  {
    files: ["**/*.ts"],
    plugins: {
      prettier: require("eslint-plugin-prettier"),
    },
    rules: {
      "prettier/prettier": "error",
    },
  },
];
