/**
 * AgroElevage Link — PostgreSQL Database Initializer Script
 * Usage: node server/database/initPostgres.js [--seed] [--reset]
 */
require('dotenv').config();
const { pool, initializePostgresDatabase } = require('../config/db_postgres');

async function run() {
  const args = process.argv.slice(2);
  const shouldReset = args.includes('--reset');
  const shouldSeed = args.includes('--seed') || !args.includes('--no-seed');

  console.log('====================================================');
  console.log(' AgroElevage Link — Initialisation Base PostgreSQL');
  console.log('====================================================');

  try {
    // 1. Test connection
    console.log('[1/3] Test de connexion au serveur PostgreSQL...');
    const testRes = await pool.query('SELECT current_database(), current_user, version()');
    console.log(` -> Connecté à la base: ${testRes.rows[0].current_database}`);
    console.log(` -> Utilisateur: ${testRes.rows[0].current_user}`);
    console.log(` -> Version: ${testRes.rows[0].version.split(',')[0]}`);

    // Optional Reset
    if (shouldReset) {
      console.log('\n[2.5/3] Réinitialisation des tables (--reset)...');
      await pool.query(`
        DROP TABLE IF EXISTS chat_messages CASCADE;
        DROP TABLE IF EXISTS ai_diagnostics CASCADE;
        DROP TABLE IF EXISTS notifications CASCADE;
        DROP TABLE IF EXISTS escrow_disputes CASCADE;
        DROP TABLE IF EXISTS escrow_transactions CASCADE;
        DROP TABLE IF EXISTS orders CASCADE;
        DROP TABLE IF EXISTS products CASCADE;
        DROP TABLE IF EXISTS product_categories CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
      `);
      console.log(' -> Tables supprimées avec succès.');
    }

    // 2. Initialize Schema & Seed
    console.log('\n[2/3] Application du Schéma PostgreSQL...');
    await initializePostgresDatabase({ runSeed: shouldSeed });

    // 3. Verification report
    console.log('\n[3/3] Vérification des tables créées :');
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    for (const row of tablesRes.rows) {
      const countRes = await pool.query(`SELECT COUNT(*) as c FROM "${row.table_name}"`);
      console.log(`  ✓ Table '${row.table_name}' : ${countRes.rows[0].c} enregistrement(s)`);
    }

    console.log('\n====================================================');
    console.log(' Base de données PostgreSQL prête pour la production !');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Échec de l initialisation PostgreSQL :');
    console.error(err.message);
    console.error('\nAstuce : Vérifiez votre variable DATABASE_URL ou vos paramètres PGHOST/PGUSER/PGPASSWORD dans le fichier .env.');
    process.exit(1);
  }
}

run();
