const express = require('express');
const usersRouter = require('./routes/users');

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/users', usersRouter);

module.exports = app;
