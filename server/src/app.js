const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const authRateLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || (15 * 60 * 1000),
  limit: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Too many authentication attempts. Please try again later.' } },
});

app.use(helmet());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRateLimiter, authRouter);
app.use('/api/users', usersRouter);

app.use(errorHandler);

module.exports = app;
