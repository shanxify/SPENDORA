const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001;

// Export app for Vercel serverless functions
module.exports = app;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  /\.vercel\.app$/,
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, etc.)
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    callback(allowed ? null : new Error('Not allowed by CORS'), allowed);
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/upload', require('./routes/upload'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/merchants', require('./routes/merchants'));
app.use('/api/stats', require('./routes/stats'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Money Tracker backend running on http://localhost:${PORT}`);
  });
}
