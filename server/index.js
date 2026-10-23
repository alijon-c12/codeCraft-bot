import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiMiddleware, loadDotEnv } from './apiMiddleware.js';

// 1. Muhit o'zgaruvchilarini yuklash
loadDotEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '..', 'dist');

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

// 2. Backend API va Telegram Bot polling middleware yaratish
const apiHandler = createApiMiddleware();

// 3. Statik fayllar uchun MIME turlari
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8'
};

// 4. Render & Web Service static file handler
function handleStaticAndHealth(req, res) {
  const host = req.headers.host || 'localhost';
  const urlObj = new URL(req.url || '/', `http://${host}`);
  const pathname = decodeURIComponent(urlObj.pathname);

  // A. Health check endpoint (Render uptime monitoring uchun)
  if (pathname === '/healthz' || pathname === '/ping') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'CodeCraft Platform & Telegram Bot',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
      })
    );
    return true;
  }

  // B. Agar frontend 'dist' papkasi mavjud bo'lsa, statik fayllarni uzatish
  if (fs.existsSync(DIST_DIR)) {
    let safePath = path.normalize(path.join(DIST_DIR, pathname));
    if (!safePath.startsWith(DIST_DIR)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return true;
    }

    if (fs.existsSync(safePath) && fs.statSync(safePath).isDirectory()) {
      safePath = path.join(safePath, 'index.html');
    }

    if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
      const ext = path.extname(safePath).toLowerCase();
      res.statusCode = 200;
      res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
      if (ext === '.html') {
        res.setHeader('Cache-Control', 'no-cache');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
      fs.createReadStream(safePath).pipe(res);
      return true;
    }

    // SPA (Single Page Application) router fallback
    const indexHtml = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexHtml)) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      fs.createReadStream(indexHtml).pipe(res);
      return true;
    }
  }

  return false;
}

// 5. Asosiy HTTP Server
const server = http.createServer((req, res) => {
  // Avval /api/* so'rovlarini backend middleware ga yo'naltirish
  apiHandler(req, res, () => {
    // Agar API bo'lmasa, statik fayl yoki healthcheck tekshirish
    const handled = handleStaticAndHealth(req, res);
    if (handled) return;

    // Dist papkasi hali yig'ilmagan bo'lsa (dev/API faqat rejim)
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify(
        {
          service: 'CodeCraft Platform API & Telegram Bot Server',
          status: 'running',
          health: '/healthz',
          endpoints: [
            'GET  /api/state',
            'POST /api/sync',
            'POST /api/auth/login',
            'POST /api/auth/register',
            'POST /api/auth/send-sms',
            'POST /api/auth/verify-sms',
            'GET  /api/lessons/:id',
            'POST /api/payments/webhook',
            'GET  /api/certificates/verify?code=EC-2026-UX9901',
            'POST /api/contact'
          ]
        },
        null,
        2
      )
    );
  });
});

server.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(`🚀 CodeCraft Server & Bot muvaffaqiyatli ishga tushdi!`);
  console.log(`📡 URL: http://${HOST}:${PORT}`);
  console.log(`🏥 Health Check: http://${HOST}:${PORT}/healthz`);
  console.log(`🤖 Telegram Bot: ${process.env.TELEGRAM_BOT_TOKEN ? 'FAOL (@CodeCraftUzBot)' : 'Token belgilanmagan'}`);
  console.log(`⚡ Muhit: ${process.env.NODE_ENV || 'production'}`);
  console.log(`====================================================\n`);
});

// To'xtatish signallari
process.on('SIGINT', () => {
  console.log('🛑 Server to\'xtatilmoqda...');
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  console.log('🛑 Server to\'xtatilmoqda...');
  server.close(() => process.exit(0));
});
