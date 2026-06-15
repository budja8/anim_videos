import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/anim_videos/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        editor: resolve(__dirname, 'editor/index.html'),
        yt: resolve(__dirname, 'yt/index.html')
      }
    }
  }
});
