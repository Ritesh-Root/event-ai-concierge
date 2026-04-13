/**
 * @fileoverview Integration tests for POST /api/chat endpoint.
 */

const request = require('supertest');

// Mock the gemini service before requiring the app
jest.mock('../src/services/gemini', () => ({
  askGemini: jest.fn().mockResolvedValue('The opening keynote starts at 09:00 in Grand Hall A.'),
  MODEL_NAME: 'gemini-2.5-flash',
}));

const app = require('../server');
const { askGemini } = require('../src/services/gemini');

describe('POST /api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a reply for a valid message', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'When is the keynote?' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toHaveProperty('reply');
    expect(typeof res.body.reply).toBe('string');
    expect(res.body.reply.length).toBeGreaterThan(0);
    expect(askGemini).toHaveBeenCalledWith('When is the keynote?');
  });

  it('should return 400 when message is missing', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({})
      .expect(400);

    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/message/i);
  });

  it('should return 400 when message is not a string', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 12345 })
      .expect(400);

    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 when message is empty string', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: '   ' })
      .expect(400);

    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/1 and 500/);
  });

  it('should return 400 when message exceeds 500 characters', async () => {
    const longMessage = 'a'.repeat(501);
    const res = await request(app)
      .post('/api/chat')
      .send({ message: longMessage })
      .expect(400);

    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/1 and 500/);
  });

  it('should strip HTML tags from the message (sanitize)', async () => {
    await request(app)
      .post('/api/chat')
      .send({ message: '<script>alert("xss")</script>Where is the keynote?' })
      .expect(200);

    // The sanitized message should have HTML tags stripped
    expect(askGemini).toHaveBeenCalledWith(
      expect.not.stringContaining('<script>')
    );
  });

  it('should return rate-limit headers', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'Hello' })
      .expect(200);

    // express-rate-limit with standardHeaders: true uses RateLimit-* headers
    expect(res.headers).toHaveProperty('ratelimit-limit');
    expect(res.headers).toHaveProperty('ratelimit-remaining');
  });

  it('should return 500 when Gemini service throws a generic error', async () => {
    askGemini.mockRejectedValueOnce(new Error('Something broke'));

    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'Hello' })
      .expect(500);

    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/went wrong/i);
  });

  it('should return 503 when Gemini API key is invalid', async () => {
    askGemini.mockRejectedValueOnce(new Error('Invalid Gemini API key. Please check your configuration.'));

    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'Hello' })
      .expect(503);

    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/unavailable/i);
  });
});

describe('GET /api/health', () => {
  it('should return status ok', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200);

    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});

describe('404 handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app)
      .get('/api/nonexistent')
      .expect(404);

    expect(res.body).toHaveProperty('error', 'Not found');
  });
});
