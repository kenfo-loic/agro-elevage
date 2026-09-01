const app = require('./app');
const config = require('./config/config');
const { seedDatabase } = require('./services/seedService');

// Seed database on startup if empty
try {
  seedDatabase();
} catch (err) {
  console.error('[Startup] Seed error:', err);
}

const server = app.listen(config.port, () => {
  console.log('====================================================');
  console.log(` AgroElevage Link & NaturIA Server Running!`);
  console.log(` URL Locale : http://localhost:${config.port}`);
  console.log(` API Root   : http://localhost:${config.port}/api`);
  console.log(` Database   : SQLite (${config.dbPath})`);
  console.log(` IA NaturIA : Activé (Mistral API + Moteur Agronomique)`);
  console.log('====================================================');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server.');
  server.close(() => {
    console.log('HTTP server closed.');
  });
});
