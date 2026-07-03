import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base matches the GitHub Pages project path: https://vcaplova.github.io/My-Cookbook/
export default defineConfig({
  plugins: [react()],
  base: '/My-Cookbook/',
});
