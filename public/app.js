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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      // Remove typing indicator
      removeTypingIndicator(loadingEl);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Server error (' + response.status + ')');
      }

      const data = await response.json();
      appendMessage(data.reply, 'ai');
    } catch (err) {
      removeTypingIndicator(loadingEl);
      showError(err.message || 'Failed to reach the server. Please try again.');
    } finally {
      setLoading(false);
      chatInput.focus();
    }
  }

  // ── Message Rendering ───────────────────────────────────────────
  function appendMessage(text, sender) {
    const el = document.createElement('div');
    el.classList.add('message', 'message--' + sender);

    if (sender === 'ai') {
      // Basic markdown-lite formatting
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
