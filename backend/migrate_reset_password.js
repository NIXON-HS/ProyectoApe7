require('dotenv').config();
const { Client } = require('pg');

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const steps = [
    `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255)`,
    `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP`,
  ];

  for (const sql of steps) {
    await client.query(sql);
    console.log('OK:', sql);
  }

  await client.end();
  console.log('Migration completed.');
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
