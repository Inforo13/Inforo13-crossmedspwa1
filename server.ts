import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();

  const distPath = path.join(process.cwd(), 'dist');

  // Detect if running the compiled production bundle or if NODE_ENV is set to production.
  // In AI Studio development (which runs 'tsx server.ts'), process.argv[1] can sometimes contain 
  // tsx's own loader directories (which may contain the word 'dist'). By checking specifically for 
  // 'server.cjs' or 'dist/server.cjs', we ensure that the development server always boots up 
  // with Vite dev middleware correctly integrated.
  const isProduction = process.env.NODE_ENV === 'production' || 
                       (process.argv[1] && (process.argv[1].endsWith('server.cjs') || process.argv[1].includes('dist/server.cjs')));

  // In development, we must listen on port 3000 for AI Studio's reverse proxy.
  // In production (e.g. Firebase App Hosting / Cloud Run), listen on process.env.PORT.
  const PORT = isProduction ? (process.env.PORT || 3000) : 3000;

  // Add a generic API health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      environment: process.env.NODE_ENV || 'development',
      port: PORT
    });
  });

  // Configure Vite middleware in development to serve the frontend of AI Studio
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development server middleware integrated.');
  } else {
    // In production, serve the compiled static files directly
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`Production static server configured. Serving paths from: ${distPath}`);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running and listening on port ${PORT} (isProduction=${isProduction})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
