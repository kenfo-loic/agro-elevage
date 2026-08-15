function errorHandler(err, req, res, next) {
  console.error('[Error Handler]', err);

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: `Erreur d'upload de fichier : ${err.message}`
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Une erreur interne est survenue sur le serveur.',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Endpoint introuvable : ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
