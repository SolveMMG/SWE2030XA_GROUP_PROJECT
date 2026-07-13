const express = require('express');const reviewRoutes =require('./routes/reviews.routes')

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/reviews', reviewRoutes);
module.exports = app;
