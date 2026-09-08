const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// PostgreSQL Connection configuration
// Priority: DATABASE_URL (Cloud Providers: Neon, Supabase, Railway, Render) -> Discrete PG environment variables -> Local default
const connectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING;

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false }
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT, 10) || 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'agroelevage_db',
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[PostgreSQL] Unexpected error on idle client:', err.message);
});

/**
 * Execute a query with parameters
 * @param {string} text - SQL Query with $1, $2 placeholders
 * @param {Array} params - Array of parameters
 */
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development' && process.env.LOG_QUERIES === 'true') {
    console.log('[PostgreSQL] Executed query:', { text: text.substring(0, 100), duration, rows: res.rowCount });
  }
  return res;
}

/**
 * Get a client from the pool for transactions
 */
async function getClient() {
  const client = await pool.connect();
  return client;
}

/**
 * Initialize schema and optional seed from SQL files
 */
async function initializePostgresDatabase(options = { runSeed: true }) {
  const client = await pool.connect();
  try {
    console.log('[PostgreSQL] Initializing tables and schema...');
    const schemaPath = path.resolve(__dirname, '..', 'database', 'schema_postgresql.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
      console.log('[PostgreSQL] Schema successfully applied.');
    }

    if (options.runSeed) {
      const seedPath = path.resolve(__dirname, '..', 'database', 'seed_postgresql.sql');
      if (fs.existsSync(seedPath)) {
        const countRes = await client.query('SELECT COUNT(*) as count FROM users');
        if (parseInt(countRes.rows[0].count, 10) === 0) {
          console.log('[PostgreSQL] Seeding initial data...');
          const seedSql = fs.readFileSync(seedPath, 'utf8');
          await client.query(seedSql);
          console.log('[PostgreSQL] Seed data successfully populated.');
        } else {
          console.log('[PostgreSQL] Database already contains records. Skipping seed.');
        }
      }
    }
  } catch (err) {
    console.error('[PostgreSQL] Error during initialization:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query,
  getClient,
  initializePostgresDatabase
};
