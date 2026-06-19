require('dotenv').config();
const { Client } = require('pg');

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const steps = [
    `CREATE TABLE IF NOT EXISTS carousel_slides (
      id             SERIAL PRIMARY KEY,
      tipo           VARCHAR(20)  DEFAULT 'standard',
      titulo         TEXT,
      subtitulo      TEXT,
      descripcion    TEXT,
      imagen_url     TEXT,
      enlace         TEXT,
      boton1_texto   VARCHAR(120) DEFAULT 'Ver más',
      boton2_texto   VARCHAR(120),
      boton2_url     TEXT,
      color_overlay  VARCHAR(80),
      alineacion     VARCHAR(10)  DEFAULT 'left',
      texto_oscuro   BOOLEAN      NOT NULL DEFAULT FALSE,
      orden          INTEGER      NOT NULL DEFAULT 0,
      activo         BOOLEAN      NOT NULL DEFAULT TRUE,
      created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_carousel_slides_activo_orden
       ON carousel_slides (activo, orden)`,
  ];

  for (const sql of steps) {
    await client.query(sql);
    console.log('OK:', sql.split('\n')[0].trim());
  }

  await client.end();
  console.log('Migration carousel completed.');
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
