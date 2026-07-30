import { defineConfig } from 'vite';

// Site 100% estático (HTML + CSS + JS em um único arquivo, sem framework).
// O Vite é usado apenas como servidor de desenvolvimento e empacotador de build,
// sem nenhuma transformação de conteúdo, layout ou comportamento.
export default defineConfig({
  root: '.',
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0
  }
});
