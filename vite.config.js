import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Set this to "/<repo-name>/" if you deploy to GitHub Pages from a project
  // repo; leave it as "/" for a user site or any other host.
  base: "/coldcoast/",
  build: { outDir: "dist", assetsInlineLimit: 4096 },
});
