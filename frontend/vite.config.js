// Dev-only proxy: lets the frontend call /api without CORS issues.
// Frontend: http://localhost:5173 (Vite), Backend: http://localhost:3000 (Express)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000", // all /api requests proxied to backend
    }
  }
});
