import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    // Tailwind v4 as a Vite plugin rather than through PostCSS. The dependency
    // and the /architecture page both already said this was the setup; only
    // the wiring was missing, and the postcss.config.cjs it replaces was
    // left over from v3. v4 prefixes through Lightning CSS, so autoprefixer
    // went with it.
    tailwindcss(),
  ],
});
