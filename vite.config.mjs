import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const API_URL = `${env.VITE_APP_BASE_NAME}`;
  const PORT = `${'3000'}`;

  return {
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
      include: ['src/**/*.{test,spec}.{js,jsx}'],
      coverage: {
        reporter: ['text', 'json', 'html']
      }
    },
    server: {
      open: true,
      port: PORT
    },
    define: {
      global: 'window'
    },
    resolve: {
      alias: []
    },
    css: {
      preprocessorOptions: {
        scss: {
          charset: false,
          silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions']
        },
        less: {
          charset: false
        }
      },
      charset: false,
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              }
            }
          }
        ]
      }
    },
    // Agrega esta sección para optimizar
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom']
          }
        }
      }
    },
    base: API_URL,
    plugins: [react(), jsconfigPaths()]
  };
});
