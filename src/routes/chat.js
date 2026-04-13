/**
 * @fileoverview Chat API route — POST /api/chat.
 * Validates user input, sanitizes it, calls the Gemini service,
 * and returns the AI-generated reply.
 * @module routes/chat
 */

const express = require('express');
const { askGemini } = require('../services/gemini');
const { createChatLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Apply rate limiter to all routes on this router
router.use(createChatLimiter());

/**
 * Sanitizes user input by stripping HTML tags and trimming whitespace.
 * @param {string} input - Raw user input.
 * @returns {string} Sanitized string.
 */
function sanitize(input) {
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * POST /api/chat
 * Expects JSON body: { message: string }
 * Returns JSON: { reply: string }
 */
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    // Validate presence
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'A "message" field (string) is required.',
      });
    }

    // Validate length
    const trimmed = message.trim();
    if (trimmed.length === 0 || trimmed.length > 500) {
      return res.status(400).json({
        error: 'Message must be between 1 and 500 characters.',
      });
    }

    // Sanitize
    const cleanMessage = sanitize(trimmed);

    // Call Gemini
    const reply = await askGemini(cleanMessage);

    return res.json({ reply });
  } catch (err) {
    console.error('[ChatRoute] Error:', err.message);

    if (err.message.includes('API key')) {
      return res.status(503).json({
        error: 'AI service is temporarily unavailable. Please try again later.',
      });
    }

    return res.status(500).json({
      error: 'Something went wrong. Please try again.',
    });
  }
});

module.exports = router;
