import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  build: {
    ssr: mode === "ssr" ? "src/ssr.tsx" : undefined,
    outDir: mode === "ssr" ? "dist-ssr" : "dist",
  },
}));
