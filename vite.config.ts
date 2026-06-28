import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        dashboard: fileURLToPath(new URL("./dashboard.html", import.meta.url)),
        assessment: fileURLToPath(new URL("./assessment.html", import.meta.url)),
        urlAnalyzer: fileURLToPath(new URL("./url-analyzer.html", import.meta.url)),
        scamAnalyzer: fileURLToPath(new URL("./scam-analyzer.html", import.meta.url)),
      },
    },
  },
});
