/**
 * Handlers de WebSocket (Socket.io)
 * CorePlayBlox - Backend
 *
 * Chat por servidor, estado de usuarios, rooms de juegos.
 */

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');
const { LIMITS } = require('../../shared/constants');

// Mapa de socketId -> { userId, username, displayName }
const connectedUsers = new Map();

// Últimos mensajes del chat (cache en memoria para nuevos conectados)
const RECENT_MESSAGES_COUNT = 50;
const recentMessages = [];

/**
 * Verifica el token JWT del handshake
 */
function verifySocketAuth(socket) {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

/**
 * Registra handlers de Socket.io
 */
function registerHandlers(io) {
  io.on('connection', (socket) => {
    const decoded = verifySocketAuth(socket);
    let user = null;

    if (decoded) {
      const db = getDatabase();
      const row = db.prepare(
        'SELECT id, username, display_name FROM users WHERE id = ?'
      ).get(decoded.id);
      if (row) {
        user = { id: row.id, username: row.username, displayName: row.display_name || row.username };
        connectedUsers.set(socket.id, user);

        // Notificar a otros que el usuario está online
        socket.broadcast.emit('user-online', { userId: user.id, username: user.displayName });
      }
    }

    // Enviar mensajes recientes al conectarse
    if (recentMessages.length > 0) {
      socket.emit('chat-history', recentMessages.slice(-RECENT_MESSAGES_COUNT));
    }

    // Unirse al chat del servidor
    socket.on('join-server', () => {
      socket.join('server-chat');
    });

    // Mensaje de chat
    socket.on('chat-message', (data) => {
      if (!user) {
        socket.emit('chat-error', { message: 'Debes iniciar sesión para chatear' });
        return;
      }

      const msg = String(data?.message || '').trim();
      if (msg.length === 0 || msg.length > LIMITS.MESSAGE_MAX) {
        socket.emit('chat-error', { message: `Mensaje inválido (max ${LIMITS.MESSAGE_MAX} caracteres)` });
        return;
      }

      const payload = {
        id: uuidv4(),
        userId: user.id,
        username: user.displayName,
        message: msg,
        createdAt: Date.now(),
      };

      recentMessages.push(payload);
      if (recentMessages.length > RECENT_MESSAGES_COUNT * 2) {
        recentMessages.splice(0, recentMessages.length - RECENT_MESSAGES_COUNT);
      }

      // Guardar en DB
      const db = getDatabase();
      db.prepare(`
        INSERT INTO chat_messages (id, server_id, user_id, username, message, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(payload.id, 'main', user.id, user.displayName, msg, payload.createdAt);

      io.to('server-chat').emit('chat-message', payload);
    });

    // Unirse a un juego (room)
    socket.on('join-game', (data) => {
      const gameId = data?.gameId;
      if (!gameId) return;
      const room = `game-${gameId}`;
      socket.join(room);
      socket.currentGameRoom = room;

      const playerInfo = user ? { userId: user.id, username: user.displayName } : { userId: null, username: 'Guest' };
      socket.to(room).emit('player-joined', playerInfo);

      // Enviar lista de jugadores actual en la room
      const roomSockets = io.sockets.adapter.rooms.get(room);
      const players = [];
      if (roomSockets) {
        for (const sid of roomSockets) {
          const u = connectedUsers.get(sid);
          if (u) players.push({ userId: u.id, username: u.displayName });
        }
      }
      socket.emit('game-players', players);
    });

    // Acción en juego (broadcast a la room)
    socket.on('game-action', (data) => {
      if (!socket.currentGameRoom) return;
      const payload = {
        userId: user?.id || null,
        username: user?.displayName || 'Guest',
        ...data,
        timestamp: Date.now(),
      };
      socket.to(socket.currentGameRoom).emit('game-state-update', payload);
    });

    // Salir del juego
    socket.on('leave-game', () => {
      if (socket.currentGameRoom) {
        const playerInfo = user ? { userId: user.id, username: user.displayName } : { userId: null, username: 'Guest' };
        socket.to(socket.currentGameRoom).emit('player-left', playerInfo);
        socket.leave(socket.currentGameRoom);
        socket.currentGameRoom = null;
      }
    });

    // Desconexión
    socket.on('disconnect', () => {
      if (socket.currentGameRoom) {
        const playerInfo = user ? { userId: user.id, username: user.displayName } : { userId: null, username: 'Guest' };
        socket.to(socket.currentGameRoom).emit('player-left', playerInfo);
      }
      if (user) {
        io.emit('user-offline', { userId: user.id });
        connectedUsers.delete(socket.id);
      }
    });
  });
}

/**
 * Obtiene la lista de usuarios conectados
 */
function getOnlineUsers() {
  return Array.from(connectedUsers.values());
}

module.exports = {
  registerHandlers,
  getOnlineUsers,
};
