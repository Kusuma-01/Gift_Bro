/**
 * Centralized Error Handling & Observability Middleware for Express
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || res.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  // Structured Log Entry
  const errorLog = {
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    statusCode,
    message: err.message || 'Internal Server Error',
    stack: isProd ? undefined : err.stack
  };

  console.error('💥 Centralized Error Handler:', JSON.stringify(errorLog, null, 2));

  res.status(statusCode).json({
    error: err.message || 'An unexpected error occurred on the server.',
    statusCode,
    ...(isProd ? {} : { details: err.stack })
  });
}
