/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// The .env file is shared with the backend, at the root of the repository.
const envDir = '..';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, '');
  const apiPort = env.API_PORT ?? '3000';

  return {
    envDir,
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': `http://localhost:${apiPort}`,
      },
    },
    test: {
      environment: 'jsdom',
    },
  };
});
