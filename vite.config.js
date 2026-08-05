import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: ".",
  publicDir: false,

  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsInlineLimit: 0,

    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        cardapio: resolve(__dirname, "cardapio.html"),
        pedido: resolve(__dirname, "pedido.html"),
        circle: resolve(__dirname, "circle.html"),
        reservas: resolve(__dirname, "reservas.html"),
      },
    },
  },
});
