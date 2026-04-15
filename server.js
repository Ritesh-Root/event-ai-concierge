require('dotenv').config();
const express = require('express');
const path = require('path');
const compression = require('compression');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const { configureHelmet, configureCors } = require('./src/middleware/security');
const chatRouter = require('./src/routes/chat');
const app = express();
const PORT = process.env.PORT || 8080;
app.use(configureHelmet());
app.use(configureCors());
app.use(express.json({ limit: '7mb' }));
app.use(compression());
app.use(xss());
app.use(mongoSanitize());
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('sw.js') || filePath.endsWith('manifest.webmanifest')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));
app.use('/api', chatRouter);
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});
app.use((err, _req, res, _next) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(err.status || 500).json({ error: err.status === 413 ? 'Payload too large' : 'Internal server error' });
});
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`✦ EventAI Concierge running on http://localhost:${PORT}`);
  });
}
function shutdown(signal) {
  console.log(`\n⏻ Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('✓ Server closed.');
      process.exit(0);
    });
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
