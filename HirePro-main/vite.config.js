import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

const __dirname = new URL('.', import.meta.url).pathname.slice(0, -1);

// Vite uses ESM syntax when the package.json sets "type": "module".
// Export configuration using the default export so that Node can load it as an ESM module.
export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required
    react(),
    tailwindcss(),
  ],

  esbuild: {
    jsx: "automatic",
  },

  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': `${__dirname}/src`,
    },
  },

  // File types to support raw imports
  assetsInclude: ['**/*.svg', '**/*.csv'],
});
