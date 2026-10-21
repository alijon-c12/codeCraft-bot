import http from 'node:http';
import { createApiMiddleware } from './apiMiddleware.js';

const PORT = process.env.PORT || 5000;
const apiHandler = createApiMiddleware();

const server = http.createServer((req, res) => {
  apiHandler(req, res, () => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        service: 'EduCenter Backend API Server',
        status: 'running',
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
      })
    );
  });
});

server.listen(PORT, () => {
  console.log(`🚀 EduCenter Backend API Server running at http://localhost:${PORT}`);
});
