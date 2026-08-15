const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/config');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const escrowRoutes = require('./routes/escrowRoutes');
const geoRoutes = require('./routes/geoRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// API Root Status Check (before static middleware to prevent dir redirect)
app.get(['/api', '/api/'], (req, res) => {
  res.json({
    success: true,
    name: 'AgroElevage Link & NaturIA API',
    version: '1.0.0',
    environment: config.nodeEnv,
    time: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      escrow: '/api/escrow',
      geo: '/api/geo',
      ai: '/api/ai',
      notifications: '/api/notifications',
      analytics: '/api/analytics'
    }
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(config.uploadDir));

// Serve root project static files (HTML, CSS, JS, Assets)
app.use(express.static(path.resolve(__dirname, '..'), { index: false }));

// Fallback error handlers
app.use('/api/*', notFoundHandler);
app.use(errorHandler);

module.exports = app;
