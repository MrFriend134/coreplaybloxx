/**
 * Inicialización de la base de datos
 * CorePlayBlox - Backend
 *
 * Crea las tablas y datos iniciales si no existen.
 * Ejecutar: node backend/database/init.js
 */

const fs = require('fs');
const path = require('path');
const { getDatabase } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Cargar schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

const db = getDatabase();

// Ejecutar schema
console.log('Creando tablas...');
db.exec(schema);

// Datos iniciales: items de catálogo de ejemplo (solo si está vacío)
const count = db.prepare('SELECT COUNT(*) as c FROM catalog_items').get();
if (count.c > 0) {
  console.log('Catálogo ya tiene datos. Saltando seed.');
  process.exit(0);
}

const catalogItems = [
  {
    id: uuidv4(),
    name: 'Sombrero Básico',
    type: 'hat',
    description: 'Un sombrero clásico para tu avatar',
    price_coins: 50,
    created_at: Date.now(),
  },
  {
    id: uuidv4(),
    name: 'Camiseta Azul',
    type: 'shirt',
    description: 'Camiseta azul casual',
    price_coins: 75,
    created_at: Date.now(),
  },
  {
    id: uuidv4(),
    name: 'Gafas de Sol',
    type: 'accessory',
    description: 'Gafas de sol estilosas',
    price_coins: 100,
    created_at: Date.now(),
  },
  {
    id: uuidv4(),
    name: 'Corona',
    type: 'hat',
    description: 'Corona dorada',
    price_coins: 500,
    created_at: Date.now(),
  },
];

const stmt = db.prepare(`
  INSERT OR IGNORE INTO catalog_items (id, name, type, description, price_coins, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

let inserted = 0;
for (const item of catalogItems) {
  const result = stmt.run(
    item.id,
    item.name,
    item.type,
    item.description,
    item.price_coins,
    item.created_at
  );
  if (result.changes > 0) inserted++;
}

console.log(`Base de datos inicializada. ${inserted} items de catálogo insertados.`);
