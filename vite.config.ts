import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/Information-Processing-GISA/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    coverage: {
      provider: "v8",
      include: ["src/core/**", "scripts/validate-lib.ts"],
      thresholds: { lines: 85 },
    },
  },
});
