import { defineConfig } from 'vite';

export default defineConfig({
  // configure-pages supplies the actual path; local development stays at root.
  base: process.env.PAGES_BASE_PATH || '/',
});
