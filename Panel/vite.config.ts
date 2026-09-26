import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  optimizeDeps: {
    needsInterop: ["moment-jalali"],
  },
  server: {
    proxy: {
      "/api": {
        target: "https://localhost:7185",
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      moment: "moment/moment.js",
    },
    tsconfigPaths: true,
  },
});
