/**
 * Componente de chat
 * CorePlayBlox - Frontend
 *
 * Panel lateral de chat por servidor, sincronizado por WebSocket.
 */

const ChatUI = (function () {
  'use strict';

  const chatPanel = document.getElementById('chat-panel');
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const btnSendChat = document.getElementById('btn-send-chat');
  const btnToggleChat = document.getElementById('btn-toggle-chat');

  function enable() {
    if (chatInput) chatInput.disabled = false;
    if (chatInput) chatInput.placeholder = 'Escribe un mensaje...';
  }

  function disable() {
    if (chatInput) {
      chatInput.disabled = true;
      chatInput.placeholder = 'Inicia sesión para chatear';
    }
  }

  function addMessage(msg) {
    if (!chatMessages) return;
    const div = document.createElement('div');
    div.className = 'chat-message';
    div.innerHTML = `<span class="username">${escapeHtml(msg.username || 'Anónimo')}</span> <span class="text">${escapeHtml(msg.message || '')}</span>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function sendMessage() {
    const text = chatInput?.value?.trim();
    if (!text) return;
    if (!State.isLoggedIn()) return;
    SocketClient.emit('chat-message', { message: text });
    chatInput.value = '';
  }

  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }
  if (btnSendChat) btnSendChat.addEventListener('click', sendMessage);

  if (btnToggleChat) {
    btnToggleChat.addEventListener('click', () => {
      chatPanel?.classList.toggle('collapsed');
      btnToggleChat.textContent = chatPanel?.classList.contains('collapsed') ? '+' : '−';
    });
  }

  // Socket listeners
  SocketClient.on('chat-message', addMessage);
  SocketClient.on('chat-history', (msgs) => {
    if (!chatMessages) return;
    chatMessages.innerHTML = '';
    (Array.isArray(msgs) ? msgs : []).forEach(addMessage);
  });
  SocketClient.on('chat-error', (data) => {
    if (data?.message) alert(data.message);
  });

  return {
    enable,
    disable,
    addMessage,
  };
})();
