import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
  // relative base so the build works at github.io/terminal/ and at the domain root
  base: './',
  plugins: [svelte()],
  server: {
    port: 3000,
  },
});
