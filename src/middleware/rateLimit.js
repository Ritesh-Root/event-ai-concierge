const rateLimit = require('express-rate-limit');
function createChatLimiter() {
  return rateLimit({
    windowMs: 60 * 1000, 
    max: 30,
    standardHeaders: true, 
    legacyHeaders: false, 
    message: {
      error: 'Too many requests. Please wait a moment before trying again.',
    },
    keyGenerator: (req) => {
      return req.ip;
    },
  });
}
module.exports = { createChatLimiter };
