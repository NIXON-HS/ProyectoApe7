require('dotenv').config();
const { Client } = require('pg');

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const steps = [
    // info_grupo table
    `CREATE TABLE IF NOT EXISTS info_grupo (
      id                          INTEGER PRIMARY KEY DEFAULT 1,
      logo_url                    TEXT,
      descripcion                 TEXT,
      descripcion_json            TEXT,
      mision                      TEXT,
      mision_json                 TEXT,
      objetivo_general            TEXT,
      objetivo_general_json       TEXT,
      objetivos_especificos       TEXT,
      objetivos_especificos_json  TEXT,
      dominio                     TEXT
    )`,
    // Seed default row
    `INSERT INTO info_grupo (id) VALUES (1) ON CONFLICT (id) DO NOTHING`,

    // Extend lineas_investigacion with long description
    `ALTER TABLE lineas_investigacion ADD COLUMN IF NOT EXISTS descripcion_larga      TEXT`,
    `ALTER TABLE lineas_investigacion ADD COLUMN IF NOT EXISTS descripcion_larga_json TEXT`,
  ];

  for (const sql of steps) {
    await client.query(sql);
    console.log('OK:', sql.slice(0, 70).replace(/\n/g, ' ') + '...');
  }

  await client.end();
  console.log('Migration completed.');
}

migrate().catch(err => { console.error(err); process.exit(1); });
