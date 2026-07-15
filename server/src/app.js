const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { errorHandler } = require('./middleware/errorHandler');

require('./services/passport');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.use('/api/v1/auth',      require('./routes/auth'));
app.use('/api/v1/users',     require('./routes/users'));
app.use('/api/v1/listings',  require('./routes/listings'));
app.use('/api/v1/uploads',   require('./routes/uploads'));
app.use('/api/v1/inquiries', require('./routes/inquiries'));
app.use('/api/v1/reviews',   require('./routes/reviews'));


app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;
