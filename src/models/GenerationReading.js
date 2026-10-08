/**
 * GenerationReading.js
 *
 * Mongoose model: GenerationReading
 * Relationship: GenerationReading -> belongs to one SolarInstallation
 *
 * This is a SEPARATE, APPEND-ONLY TIME-SERIES entity. It is NOT embedded inside
 * SolarInstallation (we must not store only the "latest" reading there).
 *
 * Backed by the `readings` collection written by src/seed/seedDatabase.js, e.g.
 *   { "_id": ObjectId, "id": "READ-00000001", "installationId": "INST-0001",
 *     "timestamp": "2026-01-01T00:00:00.000Z",
 *     "powerKw": 0, "cumulativeEnergyKwh": 0, "voltage": 0 }
 *
 * Required measurement fields:
 *   - installationId       reference to SolarInstallation
 *   - timestamp            ISO-8601 timestamp (15-minute interval)
 *   - powerKw              instantaneous power (kW)
 *   - cumulativeEnergyKwh  cumulative energy (kWh)
 *   - voltage              voltage (V)
 *
 * NOTE: `timestamp` is stored as an ISO-8601 STRING (as written from seed.json).
 * ISO-8601 UTC strings sort chronologically as plain strings, so ascending /
 * descending ordering below remains correct.
 *
 * All static lookups now query MongoDB and return Promises resolving to lean
 * plain objects (or null), keeping the same method names used by controllers.
 */

const mongoose = require('mongoose');
const { schemaOptions, PROJECTION } = require('./mongooseOptions');

const generationReadingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    installationId: { type: String, required: true, index: true }, // FK -> SolarInstallation.id
    timestamp: { type: String, required: true }, // ISO-8601 string (15-minute interval)
    powerKw: { type: Number },
    cumulativeEnergyKwh: { type: Number },
    voltage: { type: Number },
  },
  schemaOptions('readings')
);

const GenerationReading = mongoose.model('GenerationReading', generationReadingSchema);

/**
 * Find a single reading by its business id.
 * @returns {Promise<Object|null>} lean plain object, or null when not found.
 */
GenerationReading.findById = function findById(id) {
  return GenerationReading.findOne({ id }, PROJECTION).lean();
};

/**
 * Find all readings.
 * @returns {Promise<Array<Object>>} lean plain objects.
 */
GenerationReading.findAll = function findAll() {
  return GenerationReading.find({}, PROJECTION).lean();
};

/**
 * Readings for a given installation, ordered by timestamp ascending.
 * @returns {Promise<Array<Object>>} lean plain objects.
 */
GenerationReading.findByInstallation = function findByInstallation(installationId) {
  return GenerationReading.find({ installationId }, PROJECTION).sort({ timestamp: 1 }).lean();
};

/**
 * Append a new reading. GenerationReading is APPEND-ONLY: this only ever
 * inserts a new document and never updates or replaces an existing one.
 * @param {Object} data validated reading fields.
 * @returns {Promise<Object>} the created doc as a lean plain object.
 */
GenerationReading.createReading = async function createReading(data) {
  const created = await GenerationReading.create(data);
  // Re-read as a lean object so the response shape matches the GET endpoints
  // (custom `id` only, no Mongo-internal `_id` / `__v`) despite `.lean()`.
  return GenerationReading.findById(created.id);
};

module.exports = GenerationReading;

