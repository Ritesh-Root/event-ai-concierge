/**
 * @fileoverview Gemini AI service — wraps the @google/generative-ai SDK.
 * Sends user queries with event context to Google Gemini 2.5 Flash and
 * returns the model's text reply. Includes retry-with-backoff for transient
 * errors (429 / 5xx) which are common on the free tier under burst load.
 * @module services/gemini
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildSystemPrompt } = require('../utils/prompts');
const eventData = require('../utils/eventData');

const MODEL_NAME = 'gemini-2.5-flash';
const MAX_RETRIES = 2;
const BASE_BACKOFF_MS = 300;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Determines whether an error from the Gemini SDK is worth retrying.
 * Transient = 429 (rate limit) or any 5xx (upstream hiccup).
 */
function isTransient(err) {
  const status = err?.status;
  const msg = (err?.message || '').toLowerCase();
  if (status === 429 || (status >= 500 && status < 600)) {
    return true;
  }
  return /rate.?limit|quota|resource_?exhausted|unavailable|overloaded|503|500|429/.test(msg);
}

/**
 * Determines whether an error indicates an invalid API key.
 */
function isAuthError(err) {
  const status = err?.status;
  const msg = (err?.message || '').toLowerCase();
  return status === 401 || status === 403 || /api_?key_?invalid|permission_?denied|unauthenti/.test(msg);
}

/**
 * Sends a user message to Gemini with full event context and returns
 * the model's text reply. Retries up to MAX_RETRIES on transient errors.
 *
 * @param {string} userMessage - The attendee's question or request.
 * @param {object} [eventContext=eventData] - Event data object to ground the response.
 * @returns {Promise<string>} The model's text response.
 * @throws {Error} If the API key is missing, invalid, or the call ultimately fails.
 *   Thrown errors carry a `code` property: 'NO_KEY' | 'AUTH' | 'RATE_LIMIT' | 'UPSTREAM'.
 */
async function askGemini(userMessage, eventContext = eventData) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const e = new Error('GEMINI_API_KEY is not set. Please configure it in your .env file.');
    e.code = 'NO_KEY';
    throw e;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: buildSystemPrompt(JSON.stringify(eventContext, null, 2)),
  });

  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const result = await model.generateContent(userMessage);
      const text = result.response.text();
      if (!text || text.trim().length === 0) {
        return 'I apologize, but I could not generate a response. Could you rephrase your question?';
      }
      return text.trim();
    } catch (err) {
      lastErr = err;
      console.error(
        `[GeminiService] attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`,
        err.message
      );

      if (isAuthError(err)) {
        const e = new Error('Invalid Gemini API key. Please check your configuration.');
        e.code = 'AUTH';
        throw e;
      }

      if (!isTransient(err) || attempt === MAX_RETRIES) {
        break;
      }

      // Exponential backoff with small jitter
      const delay = BASE_BACKOFF_MS * 2 ** attempt + Math.floor(Math.random() * 100);
      await sleep(delay);
    }
  }

  if (isTransient(lastErr)) {
    const e = new Error(
      'AI rate limit reached — please try again in a few seconds.'
    );
    e.code = 'RATE_LIMIT';
    throw e;
  }

  const e = new Error('Failed to get a response from the AI service.');
  e.code = 'UPSTREAM';
  throw e;
}

module.exports = { askGemini, MODEL_NAME };
