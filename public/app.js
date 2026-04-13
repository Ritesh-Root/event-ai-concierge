/**
 * @fileoverview Frontend chat application.
 * Handles form submission, API calls, message rendering,
 * loading state management, and error display.
 */

(function () {
  'use strict';

  // ── DOM References ──────────────────────────────────────────────
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatTranscript = document.getElementById('chat-transcript');
  const errorBanner = document.getElementById('error-banner');
  const sendBtn = document.getElementById('send-btn');

  // ── State ───────────────────────────────────────────────────────
  let isLoading = false;

  // ── Initialise ──────────────────────────────────────────────────
  function init() {
    chatForm.addEventListener('submit', handleSubmit);

    // Suggestion chips
    document.querySelectorAll('.chip[data-query]').forEach((chip) => {
      chip.addEventListener('click', () => {
        if (isLoading) {
          return;
        }
        const query = chip.getAttribute('data-query');
        chatInput.value = query;
        handleSubmit(new Event('submit', { cancelable: true }));
      });
    });

    // Auto-resize textarea
    chatInput.addEventListener('input', autoResize);

    // Ctrl+Enter / Cmd+Enter to submit
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(
          new Event('submit', { cancelable: true, bubbles: true })
        );
      }
    });
  }

  // ── Auto-resize textarea ────────────────────────────────────────
  function autoResize() {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
  }

  // ── Submit Handler ──────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (isLoading) {
      return;
    }

    const message = chatInput.value.trim();
    if (!message) {
      return;
    }

    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    hideError();

    // Render user message
    appendMessage(message, 'user');

    // Show loading
    setLoading(true);
    const loadingEl = showTypingIndicator();

    try {
      const data = await sendChat(message);
      removeTypingIndicator(loadingEl);
      appendMessage(data.reply, 'ai');
    } catch (err) {
      removeTypingIndicator(loadingEl);
      const friendly = err.message || 'Failed to reach the server. Please try again.';
      appendMessage(friendly, 'error');
      showError(friendly);
    } finally {
      setLoading(false);
      chatInput.focus();
    }
  }

  /**
   * Sends a chat message with one automatic retry on 429 (rate limit).
   */
  async function sendChat(message) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        return response.json();
      }

      const data = await response.json().catch(() => ({}));

      // Retry once on rate limit, after a short pause
      if (response.status === 429 && attempt === 0) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }

      throw new Error(data.error || 'Server error (' + response.status + ')');
    }
    throw new Error('The AI is still busy. Please try again in a moment.');
  }

  // ── Message Rendering ───────────────────────────────────────────
  function appendMessage(text, sender) {
    const el = document.createElement('div');
    el.classList.add('message', 'message--' + sender);

    if (sender === 'error') {
      el.setAttribute('role', 'alert');
      el.textContent = '⚠️ ' + text;
    } else if (sender === 'ai') {
      el.innerHTML = formatAIResponse(text);
    } else {
      el.textContent = text;
    }

    chatTranscript.appendChild(el);
    scrollToBottom();
  }

  /**
   * Minimal markdown-to-HTML for AI responses.
   * Handles bold, bullet lists, and line breaks. Escapes HTML first.
   */
  function formatAIResponse(text) {
    // Escape HTML entities
    let safe = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold: **text**
    safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Bullet lists: lines starting with "- " or "* "
    safe = safe.replace(/^[-*]\s+(.+)$/gm, '• $1');

    // Line breaks
    safe = safe.replace(/\n/g, '<br/>');

    return safe;
  }

  // ── Typing Indicator ───────────────────────────────────────────
  function showTypingIndicator() {
    const el = document.createElement('div');
    el.classList.add('message', 'message--loading');
    el.setAttribute('aria-label', 'AI is thinking');
    el.innerHTML =
      '<span class="typing-dot"></span>' +
      '<span class="typing-dot"></span>' +
      '<span class="typing-dot"></span>';
    chatTranscript.appendChild(el);
    scrollToBottom();
    return el;
  }

  function removeTypingIndicator(el) {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  // ── Loading State ───────────────────────────────────────────────
  function setLoading(loading) {
    isLoading = loading;
    sendBtn.disabled = loading;
    chatInput.disabled = loading;
    chatTranscript.setAttribute('aria-busy', String(loading));
    document.querySelectorAll('.chip[data-query]').forEach((chip) => {
      chip.disabled = loading;
      chip.setAttribute('aria-disabled', String(loading));
    });
  }

  // ── Error Banner ────────────────────────────────────────────────
  function showError(msg) {
    errorBanner.textContent = msg;
    errorBanner.classList.remove('hidden');
    // Auto-hide after 8 seconds
    setTimeout(hideError, 8000);
  }

  function hideError() {
    errorBanner.classList.add('hidden');
    errorBanner.textContent = '';
  }

  // ── Scroll ──────────────────────────────────────────────────────
  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatTranscript.scrollTop = chatTranscript.scrollHeight;
    });
  }

  // ── Boot ────────────────────────────────────────────────────────
  init();
})();
