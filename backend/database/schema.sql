-- CorePlayBlox - Schema de Base de Datos
-- SQLite compatible - puede adaptarse a PostgreSQL

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  core_coins INTEGER DEFAULT 100,
  avatar_data TEXT DEFAULT '{}',
  created_at INTEGER NOT NULL,
  last_login INTEGER,
  display_name TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Tabla de sesiones/tokens (para JWT blacklist si se implementa)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Tabla de amistades
CREATE TABLE IF NOT EXISTS friendships (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  friend_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, friend_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (friend_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);

-- Tabla de juegos
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  game_data TEXT NOT NULL,
  plays_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  is_public INTEGER DEFAULT 1,
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_games_creator ON games(creator_id);
CREATE INDEX IF NOT EXISTS idx_games_created ON games(created_at DESC);

-- Tabla de mensajes de chat (por servidor)
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  server_id TEXT DEFAULT 'main',
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_chat_server ON chat_messages(server_id, created_at DESC);

-- Catálogo de items (accesorios, etc.)
CREATE TABLE IF NOT EXISTS catalog_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT DEFAULT '',
  price_coins INTEGER NOT NULL,
  asset_url TEXT DEFAULT '',
  asset_data TEXT DEFAULT '{}',
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_catalog_type ON catalog_items(type);

-- Inventario de usuarios
CREATE TABLE IF NOT EXISTS user_inventory (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  catalog_item_id TEXT NOT NULL,
  purchased_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_user ON user_inventory(user_id);

-- Códigos promocionales (solo ejemplo técnico, moneda ficticia)
CREATE TABLE IF NOT EXISTS promo_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  core_coins_amount INTEGER NOT NULL,
  uses_total INTEGER DEFAULT 1,
  uses_left INTEGER DEFAULT 1,
  expires_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_promo_code ON promo_codes(code);

-- Redenciones de códigos
CREATE TABLE IF NOT EXISTS promo_code_redemptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  code TEXT NOT NULL,
  redeemed_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_redemptions_user ON promo_code_redemptions(user_id);
