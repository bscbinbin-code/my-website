import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local archives and generated artifacts that are not app source.
    "design-md-library/**",
    "skill-install-extract/**",
    "skills/**",
    "temp/**",
    "*.log",
    "*.png",
    "tsconfig.tsbuildinfo",
  ]),
]);

export default eslintConfig;
