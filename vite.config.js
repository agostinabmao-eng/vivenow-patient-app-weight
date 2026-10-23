import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// inlineDynamicImports — jsPDF's unused .html() method otherwise pulls in
// html2canvas/dompurify as separate chunks that would never be published
// (the Artifact publish step only ships an explicit file list) and would
// 404 if ever dynamically imported. One bundle avoids that; the filename
// overrides keep it at the flat app.js/app.css the Artifact entry expects.
export default defineConfig({
  plugins: [react()],
  build: {
    // photos in src/assets/photos are ~100 KB each; inlining keeps the build
    // a flat app.js/app.css/index.html set the Artifact publish step expects.
    assetsInlineLimit: 400000,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: (info) => (info.name && info.name.endsWith('.css') ? 'app.css' : '[name][extname]'),
      },
    },
  },
});
