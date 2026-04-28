import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  publicDir: "public",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        home: resolve(__dirname, "home.html"),
        lander: resolve(__dirname, "lander.html"),
        diy: resolve(__dirname, "diy.html"),
        build: resolve(__dirname, "build.html"),
        funnel: resolve(__dirname, "funnel.html"),
      },
    },
  },
});
