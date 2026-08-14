import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { readQwenPawVersion } from "../buildVersion";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appVersion = readQwenPawVersion(path.resolve(__dirname, "../.."));

  return {
    define: {
      VITE_API_BASE_URL: JSON.stringify(env.VITE_API_BASE_URL ?? ""),
      VITE_APP_VERSION: JSON.stringify(appVersion),
      TOKEN: JSON.stringify(env.TOKEN || ""),
      MOBILE: false,
    },
    plugins: [react()],
    css: {
      modules: {
        localsConvention: "camelCase",
        generateScopedName: "[name]__[local]__[hash:base64:5]",
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "../src"),
      },
    },
    build: {
      outDir: "dist-tauri",
      emptyOutDir: true,
      sourcemap: false,
      cssCodeSplit: true,
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, "../tauri.html"),
        },
      },
    },
  };
});
