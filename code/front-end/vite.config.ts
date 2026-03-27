import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve the provided repo `data/` folder as static assets.
const dataDir = path.resolve(__dirname, '../../data');

export default defineConfig({
  publicDir: dataDir,
  server: {
    port: 5173,
  },
});

