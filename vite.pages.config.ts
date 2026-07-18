import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/le-quai-des-ecritures/" : "/",
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    outDir: "gh-pages-dist",
    emptyOutDir: true,
    rollupOptions: {
      input: "index.pages.html",
    },
  },
});
