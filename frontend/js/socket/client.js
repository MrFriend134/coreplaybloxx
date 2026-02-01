/**
 * Cliente WebSocket (Socket.io)
 * CorePlayBlox - Frontend
 *
 * Conexión en tiempo real para chat y juegos multijugador.
 */

let socket = null;
let token = null;

const SocketClient = {
  /**
   * Inicializa la conexión WebSocket
   * @param {string} authToken - JWT para autenticación opcional
   */
  connect(authToken) {
    token = authToken;
    if (socket?.connected) return socket;

    socket = io(CONFIG.WS_URL, {
      auth: { token: authToken || '' },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[Socket] Conectado');
      socket.emit('join-server');
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Desconectado:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Error:', err.message);
    });

    return socket;
  },

  /**
   * Actualiza el token y reconecta si es necesario
   */
  setToken(newToken) {
    token = newToken;
    if (socket) {
      socket.auth = { token: newToken || '' };
      if (!socket.connected) socket.connect();
    }
  },

  /**
   * Desconecta
   */
  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  /**
   * Emite un evento
   */
  emit(event, data) {
    if (socket?.connected) socket.emit(event, data);
  },

  /**
   * Registra un listener
   */
  on(event, callback) {
    if (!socket) this.connect(token);
    socket.on(event, callback);
    return () => socket?.off(event, callback);
  },

  /**
   * Quita un listener
   */
  off(event, callback) {
    socket?.off(event, callback);
  },

  isConnected() {
    return !!socket?.connected;
  },
};
