/**
 * db.js
 *
 * MongoDB Atlas connection setup for the Solar Generation Data API.
 *
 * Responsibilities:
 *   - Read the connection string from the MONGODB_URI environment variable.
 *   - Establish a single Mongoose connection for the whole application.
 *   - Expose small helpers so the app entry point can connect/disconnect and
 *     report connection state without knowing Mongoose internals.
 *
 * Design notes:
 *   - This module ONLY manages the connection. It does NOT define schemas,
 *     models, or seed data (the project keeps using its existing in-memory
 *     data layer for the current routes).
 *   - Sensible default options are used; mongoose 6+ no longer needs the
 *     legacy useNewUrlParser/useUnifiedTopology flags.
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas using MONGODB_URI from the environment.
 *
 * @param {string} [uri] Optional override; defaults to process.env.MONGODB_URI.
 * @returns {Promise<typeof mongoose>} The resolved mongoose instance.
 * @throws {Error} If MONGODB_URI is missing or the connection fails.
 */
async function connectDB(uri = process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error('MONGODB_URI is not defined. Add it to your .env file.');
  }

  // Avoid creating multiple connections if connectDB is called more than once.
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  mongoose.connection.on('connected', () => {
    console.log(`[db] MongoDB connected (database: ${mongoose.connection.name})`);
  });

  mongoose.connection.on('error', (err) => {
    console.error('[db] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected');
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  return mongoose;
}

/**
 * Close the active MongoDB connection (used for graceful shutdown / tests).
 *
 * @returns {Promise<void>}
 */
async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

/**
 * Human-readable connection state of the Mongoose default connection.
 *
 * @returns {'disconnected'|'connected'|'connecting'|'disconnecting'|'unknown'}
 */
function getConnectionState() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
}

module.exports = { connectDB, disconnectDB, getConnectionState };
