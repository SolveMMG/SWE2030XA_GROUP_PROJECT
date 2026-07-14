<<<<<<< HEAD
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';

  // Structured AppError thrown intentionally by application code
  if (err.status && err.code) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message },
    });
  }

  // Unexpected error — log it and return a generic 500
  console.error(err);
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isDev ? err.message : 'An unexpected error occurred',
    },
  });
};

module.exports = errorHandler;
=======
function errorHandler(err, req, res, _next) {
  console.error(err);

  if (err.type === 'AppError') {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }

  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
}

class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.type = 'AppError';
    this.status = status;
    this.code = code;
  }
}

module.exports = { errorHandler, AppError };
>>>>>>> 2eedb49 (feat: implement authentication and authorization middleware)
