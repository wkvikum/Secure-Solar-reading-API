/**
 * seedDatabase.js
 *
 * Loads the existing seed data (src/seed/seed.json) into MongoDB Atlas.
 *
 * Responsibilities:
 *   - Reuse the project's existing MongoDB connection (src/config/db.js).
 *   - Read seed.json and insert its entities into separate collections:
 *       provinces, districts, substations, installations, readings, users
 *   - Insert the large `readings` collection (1.2M+) in batches using
 *     insertMany() to keep memory usage bounded.
 *   - Preserve the existing document structure and IDs exactly as-is.
 *   - Close the MongoDB connection when finished, with clear
 *     success / error reporting.
 *
 * It does NOT touch generateSeed.js, routes, controllers, or API logic, and it
 * never generates new data -- it only loads what already exists in seed.json.
 *
 * The file is parsed with a small, dependency-free streaming JSON reader so we
 * never hold the whole 30MB+ file (or its 1.2M-element array) in memory at
 * once. This intentionally avoids external JSON-stream libraries so the script
 * runs on plain CommonJS Node with no module-resolution pitfalls.
 *
 * Run from the project root:
 *   node src/seed/seedDatabase.js
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');

const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SEED_PATH = path.join(__dirname, 'seed.json');

// Number of documents sent to MongoDB per insertMany() call. Keeps memory flat
// while seeding the huge `readings` collection.
const BATCH_SIZE = 5000;

// Small reference collections, cleared before inserting for a clean, repeatable
// seed. `readings` is handled separately (streamed, with an existence check).
const REFERENCE_COLLECTIONS = ['provinces', 'districts', 'substations', 'installations', 'users'];

// ---------------------------------------------------------------------------
// Minimal streaming JSON parser (dependency-free)
//
// We only need to walk the TOP LEVEL of seed.json and, for each top-level array
// property (e.g. "readings"), stream its element objects one at a time. This
// avoids loading the 30MB+ file or a 1.2M-element array fully into memory.
// ---------------------------------------------------------------------------

/**
 * Create a character-fed parser that calls `onItem(rootKey, item)` for every
 * element object of every top-level array property in seed.json.
 */
function createStreamingSeedParser(onItem) {
  let depth = 0; // structural depth; the root object is depth 1
  let inString = false;
  let escaped = false;
  let stringBuf = '';

  let rootKey = null; // current top-level property name
  let expectTopKey = false; // next string at depth 1 is a property name
  let expectTopValue = false; // a top-level value begins after the ':'

  let rootArray = false; // current top-level value is an array (its items stream)
  let capturing = false; // capturing one element object of the current array
  let objDepth = 0;
  let objBuf = '';

  function handle(ch) {
    // ----- inside a string ------------------------------------------------
    if (inString) {
      if (escaped) {
        if (capturing) objBuf += ch;
        escaped = false;
        return;
      }
      if (ch === '\\') {
        if (capturing) objBuf += ch;
        escaped = true;
        return;
      }
      if (ch === '"') {
        inString = false;
        if (capturing) objBuf += ch;
        if (expectTopKey && depth === 1) {
          rootKey = stringBuf;
          stringBuf = '';
        }
        return;
      }
      if (capturing) objBuf += ch;
      if (expectTopKey) stringBuf += ch;
      return;
    }

    // ----- not inside a string --------------------------------------------
    if (ch === '"') {
      inString = true;
      if (capturing) objBuf += ch;
      else if (depth === 1 && !expectTopKey && !expectTopValue) {
        expectTopKey = true; // opening quote of a top-level key
        stringBuf = '';
      }
      return;
    }

    if (ch === '{' || ch === '[') {
      if (capturing) {
        objDepth += 1;
        objBuf += ch;
        depth += 1;
        return;
      }

      // Start of an element object inside the currently streamed top-level
      // array. The top-level array lives at depth 2, so an element `{` appears
      // while `depth` is 2; it then takes depth to 3.
      if (rootArray && !expectTopValue && depth === 2 && ch === '{') {
        capturing = true;
        objDepth = 1;
        objBuf = ch;
        depth += 1;
        return;
      }

      depth += 1;
      if (expectTopValue && depth === 2) {
        // start of a top-level value container
        expectTopValue = false;
        rootArray = ch === '[';
      }
      return;
    }

    if (ch === '}' || ch === ']') {
      if (capturing) {
        objDepth -= 1;
        objBuf += ch;
        depth -= 1;
        if (objDepth === 0) {
          let parsed;
          try {
            parsed = JSON.parse(objBuf);
          } catch (err) {
            throw new Error(`Failed to parse an item of "${rootKey}": ${err.message}`);
          }
          capturing = false;
          objBuf = '';
          onItem(rootKey, parsed);
        }
        return;
      }
      depth -= 1;
      if (rootArray && depth === 1) {
        // closed the top-level array
        rootArray = false;
        rootKey = null;
      }
      return;
    }

    if (ch === ':' && depth === 1 && expectTopKey) {
      expectTopKey = false;
      expectTopValue = true;
      return;
    }

    if (ch === ',' && depth === 1) {
      // boundary between top-level properties
      rootKey = null;
      rootArray = false;
      expectTopKey = false;
      expectTopValue = false;
      return;
    }

    // Any other character (colons, digits, whitespace, ...) belongs to the
    // element object currently being captured, so append it verbatim.
    if (capturing) {
      objBuf += ch;
      return;
    }

    // Whitespace / scalar characters between elements (outside capture) are
    // safely ignored.
  }

  return { handle };
}

/**
 * Stream a top-level array property from seed.json, invoking `onItem` for each
 * element object. `onItem` may return a promise; the read stream is paused
 * until it settles, providing back-pressure.
 */
function streamProperty(propertyName, onItem) {
  return new Promise((resolve, reject) => {
    const parser = createStreamingSeedParser((key, item) => {
      if (key !== propertyName) return;
      const result = onItem(item);
      if (result && typeof result.then === 'function') {
        stream.pause();
        result.then(
          () => stream.resume(),
          (err) => {
            stream.destroy();
            reject(err);
          }
        );
      }
    });

    const stream = fs.createReadStream(SEED_PATH, { encoding: 'utf8', highWaterMark: 64 * 1024 });

    stream.on('data', (chunk) => {
      try {
        for (let i = 0; i < chunk.length; i += 1) parser.handle(chunk[i]);
      } catch (err) {
        stream.destroy();
        reject(err);
      }
    });
    stream.on('end', () => resolve());
    stream.on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// Seeding helper
// ---------------------------------------------------------------------------

/**
 * Stream a top-level array property from seed.json into a MongoDB collection in
 * batches of BATCH_SIZE using insertMany().
 *
 * @param {string} collectionName Destination collection name.
 * @param {string} propertyName   Top-level key in seed.json.
 * @returns {Promise<number>} Number of documents inserted.
 */
async function insertCollection(collectionName, propertyName) {
  const collection = mongoose.connection.collection(collectionName);
  let batch = [];
  let inserted = 0;

  const flush = async () => {
    if (batch.length === 0) return;
    const docs = batch;
    batch = [];
    await collection.insertMany(docs, { ordered: false });
    inserted += docs.length;
  };

  await streamProperty(propertyName, async (item) => {
    batch.push(item);
    if (batch.length >= BATCH_SIZE) {
      await flush();
    }
  });

  await flush();
  return inserted;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seed() {
  console.log('[seed] Starting database seeding...');
  console.log(`[seed] Source: ${SEED_PATH}`);

  if (!fs.existsSync(SEED_PATH)) {
    throw new Error(`seed.json not found at ${SEED_PATH}. Run generateSeed.js first.`);
  }

  // Connect using the existing project connection helper.
  await connectDB();
  console.log(`[seed] Connected to database: ${mongoose.connection.name}`);

  const summary = {};

  // Small reference collections: clear then insert.
  for (const name of REFERENCE_COLLECTIONS) {
    const collection = mongoose.connection.collection(name);
    await collection.deleteMany({});

    const count = await insertCollection(name, name);
    summary[name] = count;
    console.log(`[seed] Inserted ${count.toLocaleString()} documents into "${name}".`);
  }

  // Large time-series readings collection.
  const readings = mongoose.connection.collection('readings');
  const existing = await readings.estimatedDocumentCount();

  if (existing > 0) {
    console.log(
      `[seed] "readings" already contains ${existing.toLocaleString()} documents; skipping. ` +
        'Drop the collection manually to re-seed.'
    );
    summary.readings = existing;
  } else {
    const count = await insertCollection('readings', 'readings');
    summary.readings = count;
    console.log(`[seed] Inserted ${count.toLocaleString()} documents into "readings".`);
  }

  // Indexes on the preserved custom IDs (and the readings time-series pattern).
  for (const name of REFERENCE_COLLECTIONS) {
    await mongoose.connection.collection(name).createIndex({ id: 1 }, { unique: true });
  }
  await readings.createIndex({ installationId: 1, timestamp: 1 });
  await readings.createIndex({ id: 1 }, { unique: true });

  // ---------------------------------------------------------------------
  // Success report
  // ---------------------------------------------------------------------
  const total = Object.values(summary).reduce((a, b) => a + b, 0);
  console.log('----------------------------------------');
  console.log('[seed] Seeding completed successfully.');
  Object.entries(summary).forEach(([name, count]) => {
    console.log(`  ${name.padEnd(14)}: ${count.toLocaleString()}`);
  });
  console.log(`  ${'TOTAL'.padEnd(14)}: ${total.toLocaleString()}`);
  console.log('----------------------------------------');
}

seed()
  .catch((err) => {
    console.error('[seed] ERROR: Seeding failed.');
    console.error(`       ${err.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Always close the MongoDB connection, success or failure.
    try {
      await disconnectDB();
      console.log('[seed] MongoDB connection closed.');
    } catch (closeErr) {
      console.error(`[seed] Failed to close MongoDB connection: ${closeErr.message}`);
    }
  });
