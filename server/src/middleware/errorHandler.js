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
