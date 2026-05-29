const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  const message = err.message || 'Error Interno del Servidor';
  res.status(status).json({
    success: false,
    status,
    message,
    errors: err.errors || null,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: `Ruta ${req.originalUrl} no encontrada en este servidor`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
