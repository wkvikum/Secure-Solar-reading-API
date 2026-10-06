// Load environment variables from .env before anything else reads process.env.
require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const apiRouter = require('./src/routes');
const { connectDB, disconnectDB } = require('./src/config/db');

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', session: 'NB6007CEM S2' });
});

// All resource endpoints are namespaced under /api
app.use('/api', apiRouter);

// Start the HTTP server only after MongoDB has connected successfully.
async function start() {
  try {
    await connectDB();
    const server = app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });

    // Graceful shutdown: close HTTP server then the MongoDB connection.
    const shutdown = async (signal) => {
      console.log(`\n[app] ${signal} received, shutting down...`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('[app] Failed to start:', err.message);
    process.exit(1);
  }
}

start();
