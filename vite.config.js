import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { createApiMiddleware } from './server/apiMiddleware.js';

function eduCenterBackendPlugin() {
  let middleware = null;
  return {
    name: 'educenter-backend-api',
    configureServer(server) {
      if (!middleware) {
        middleware = createApiMiddleware();
      }
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          return middleware(req, res, next);
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), eduCenterBackendPlugin()]
});
