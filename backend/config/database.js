/**
 * Configuración de la base de datos
 * CorePlayBlox - Backend
 *
 * Usa better-sqlite3 para desarrollo. En producción se puede cambiar
 * a PostgreSQL usando el mismo esquema.
 */

const path = require('path');
const Database = require('better-sqlite3');

// Ruta a la base de datos SQLite
const DB_PATH = path.join(__dirname, '..', '..', 'data', 'coreplayblox.db');

let db = null;

/**
 * Obtiene la instancia de la base de datos (singleton)
 * @returns {Database} Instancia de SQLite
 */
function getDatabase() {
  if (!db) {
    const fs = require('fs');
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

/**
 * Cierra la conexión a la base de datos
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  getDatabase,
  closeDatabase,
  DB_PATH,
};
