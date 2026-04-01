const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Create required directories if they don't exist
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Initialize empty data files if they don't exist
['transactions.json', 'categories.json', 'merchantMap.json'].forEach(file => {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
});

const app = express();
const PORT = process.env.PORT || 5001;

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

app.listen(PORT, () => {
  console.log(`Money Tracker backend running on http://localhost:${PORT}`);
});
