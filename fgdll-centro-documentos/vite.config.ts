import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // Rutas relativas: la app funciona en la raíz de un dominio o dentro de
  // una subcarpeta (p. ej. GitHub Pages: /herramientas/centro-documentos/).
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
