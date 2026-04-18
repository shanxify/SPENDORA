// Vercel serverless catch-all for all /api/* routes
// Load backend deps from this directory (Vercel bundles from here)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: __dirname + '/server/.env.local' });
}

const app = require('./server/server');
module.exports = app;
