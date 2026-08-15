const path = require('path');
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'agroelevage_secret_jwt_key_2026_cameroon_safe',
  jwtExpiresIn: '7d',
  dbPath: path.resolve(__dirname, '..', 'database', 'agroelevage.sqlite'),
  mistralApiKey: process.env.MISTRAL_API_KEY || 'z57COatI91evfWOECqgbzh5ZSWBiuoMs',
  mistralModel: process.env.MISTRAL_MODEL || 'mistral-large-latest',
  uploadDir: path.resolve(__dirname, '..', 'uploads'),
  commissionPercent: parseFloat(process.env.DEFAULT_COMMISSION_PERCENT) || 2.5
};
