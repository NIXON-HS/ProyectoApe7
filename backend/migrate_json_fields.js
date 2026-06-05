/**
 * Migration: Add JSON rich-content fields to proyectos and publicaciones tables.
 * Run once: node backend/migrate_json_fields.js
 */
require('dotenv').config();
const { Client } = require('pg');

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const steps = [
    `ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS descripcion_json TEXT`,
    `ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS objetivos_json   TEXT`,
    `ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS resultados_json  TEXT`,
    `ALTER TABLE publicaciones ADD COLUMN IF NOT EXISTS resumen_json TEXT`,
  ];

  for (const sql of steps) {
    await client.query(sql);
    console.log('OK:', sql);
  }

  await client.end();
  console.log('Migration completed.');
}

migrate().catch(err => { console.error(err); process.exit(1); });
