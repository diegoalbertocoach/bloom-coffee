# Bloom Coffee

Site institucional do Bloom Coffee (Balneário Camboriú).

Este projeto é um site **estático** (um único `index.html` autocontido, com CSS e
JS inline e imagens embutidas em base64). O Vite é usado apenas como servidor
de desenvolvimento e empacotador de build — nenhum framework de UI é usado e
nenhum conteúdo/estilo/comportamento foi alterado.

## Rodar localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
```

Os arquivos finais são gerados em `dist/`.

## Deploy na Vercel

1. Suba este repositório no GitHub.
2. Importe o repositório na Vercel.
3. A Vercel detecta o `vercel.json` (build command `npm run build`,
   output directory `dist`) e o `package.json` automaticamente.
4. Clique em **Deploy**. Nenhuma configuração manual é necessária.
