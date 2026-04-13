/**
 * @fileoverview Express application entry point.
 * Applies security middleware, serves static assets, mounts API routes,
 * and handles graceful shutdown.
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const { configureHelmet, configureCors } = require('./src/middleware/security');
const chatRouter = require('./src/routes/chat');

const app = express();
const PORT = process.env.PORT || 8080;

// ── Security ──────────────────────────────────────────────────────────
app.use(configureHelmet());
app.use(configureCors());

// ── Body parsing ──────────────────────────────────────────────────────
app.use(express.json({ limit: '16kb' }));

// ── Static files ──────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API routes ────────────────────────────────────────────────────────
app.use('/api/chat', chatRouter);

// ── Health check ──────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 fallback ──────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Global error handler ──────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(err.status || 500).json({ error: err.status === 413 ? 'Payload too large' : 'Internal server error' });
});

// ── Start server ──────────────────────────────────────────────────────
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`✦ EventAI Concierge running on http://localhost:${PORT}`);
  });
}

// ── Graceful shutdown ─────────────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n⏻ Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('✓ Server closed.');
      process.exit(0);
    });
    // Force exit after 5 seconds if connections are hanging
    setTimeout(() => {
      console.warn('⚠ Forcing shutdown after timeout.');
      process.exit(1);
    }, 5000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
