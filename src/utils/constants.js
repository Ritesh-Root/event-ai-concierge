const MAX_MESSAGE_LEN = 500;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIMES = Object.freeze(
  new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
);
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 30;
const JSON_BODY_LIMIT = '7mb';
const TEXT_MODEL = 'gemini-2.5-flash-lite';
const VISION_MODEL = 'gemini-2.5-flash';
const EMBEDDING_MODEL = 'text-embedding-004';
const MAX_RETRIES = 2;
const BASE_BACKOFF_MS = 300;
const RESPONSE_CACHE_SIZE = 64;
const RESPONSE_CACHE_TTL_MS = 5 * 60 * 1000;
module.exports = Object.freeze({
  MAX_MESSAGE_LEN,
  MAX_IMAGE_BYTES,
  ALLOWED_IMAGE_MIMES,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
  JSON_BODY_LIMIT,
  TEXT_MODEL,
  VISION_MODEL,
  EMBEDDING_MODEL,
  MAX_RETRIES,
  BASE_BACKOFF_MS,
  RESPONSE_CACHE_SIZE,
  RESPONSE_CACHE_TTL_MS,
});
