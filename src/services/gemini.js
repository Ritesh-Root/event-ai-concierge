/**
 * @fileoverview Gemini AI service — wraps the @google/generative-ai SDK.
 * Provides a single function to send user queries with event context
 * to Google Gemini 2.5 Flash and return the model's text response.
 * @module services/gemini
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildSystemPrompt } = require('../utils/prompts');
const eventData = require('../utils/eventData');

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Sends a user message to Gemini with full event context and returns
 * the model's text reply.
 *
 * @param {string} userMessage - The attendee's question or request.
 * @param {object} [eventContext=eventData] - Event data object to ground the response.
 * @returns {Promise<string>} The model's text response.
 * @throws {Error} If the API key is missing or the API call fails.
 *
 * @example
 * const reply = await askGemini('Where is the keynote?');
 * console.log(reply); // "The opening keynote is in Grand Hall A..."
 */
async function askGemini(userMessage, eventContext = eventData) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. Please configure it in your .env file.'
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: buildSystemPrompt(JSON.stringify(eventContext, null, 2)),
  });

  try {
    const result = await model.generateContent(userMessage);
    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      return 'I apologize, but I could not generate a response. Could you rephrase your question?';
    }

    return text.trim();
  } catch (err) {
    console.error('[GeminiService] API call failed:', err.message);

    if (err.message?.includes('API_KEY_INVALID') || err.status === 401) {
      throw new Error('Invalid Gemini API key. Please check your configuration.');
    }
    if (err.message?.includes('RATE_LIMIT') || err.status === 429) {
      throw new Error('Gemini API rate limit reached. Please try again shortly.');
    }

    throw new Error('Failed to get a response from the AI service.');
  }
}

module.exports = { askGemini, MODEL_NAME };
