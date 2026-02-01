/**
 * Servidor principal - CorePlayBlox
 *
 * Express + Socket.io + SQLite
 * Sirve el frontend estático y la API REST.
 */

require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

const apiRoutes = require('./routes');
const { registerHandlers } = require('./socket/handlers');
const { getDatabase } = require('./config/database');

const PORT = process.env.PORT || 3000;
const frontendPath = path.join(__dirname, '..', 'frontend');

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// API
app.use('/api', apiRoutes);

// Frontend estático
app.use(express.static(frontendPath));

// SPA fallback - todas las rutas no-API sirven index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Inicializar base de datos y schema si no existe
const fs = require('fs');
const schemaPath = path.join(__dirname, 'database', 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const db = getDatabase();
  const schema = fs.readFileSync(schemaPath, 'utf8');
  try {
    db.exec(schema);
  } catch (e) {
    // Tablas ya existen
  }
}

// Socket handlers
registerHandlers(io);

// Exponer io para uso en otras partes si se necesita
app.set('io', io);

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`CorePlayBlox server running at http://localhost:${PORT}`);
  console.log(`Frontend: ${frontendPath}`);
});
