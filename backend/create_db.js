const { Client } = require('pg');

async function createDatabase() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // Connect to default database
    password: '12345',
    port: 5432,
  });

  try {
    await client.connect();
    // Check if reasons_db exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'reasons_db'");
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE reasons_db');
      console.log('Database reasons_db created successfully!');
    } else {
      console.log('Database reasons_db already exists.');
    }
  } catch (err) {
    console.error('Error creating database:', err.stack);
  } finally {
    await client.end();
  }
}

createDatabase();
