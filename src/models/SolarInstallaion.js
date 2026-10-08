/**
 * SolarInstallaion.js
 *
 * Mongoose model: SolarInstallation
 * Relationship: SolarInstallation -> belongs to one Grid Substation;
 *               has many Generation Readings
 *
 * IMPORTANT MODELLING RULE:
 *   meterId and inverterId are ATTRIBUTES of the SolarInstallation itself.
 *   There is deliberately NO separate "Device" model.
 *
 * Backed by the `installations` collection written by src/seed/seedDatabase.js,
 * e.g.
 *   { "_id": ObjectId, "id": "INST-0001", "name": "Colombo City Solar Plant 01",
 *     "substationId": "SUB-01", "meterId": "MTR-000001",
 *     "inverterId": "INV-000001", "type": "Rooftop",
 *     "panelBrand": "JinkoSolar", "capacityKw": 344.8,
 *     "commissionDate": "2022-04-03", "status": "active" }
 *
 * NOTE: the file name ("SolarInstallaion") is kept as-is to match the existing
 * project structure. It exports the correctly-named `SolarInstallation` model.
 *
 * All static lookups now query MongoDB and return Promises resolving to lean
 * plain objects (or null), keeping the same method names used by controllers.
 */

const mongoose = require('mongoose');
const { schemaOptions, PROJECTION } = require('./mongooseOptions');

const solarInstallationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    substationId: { type: String, required: true, index: true }, // FK -> GridSubstation.id
    meterId: { type: String }, // device identifiers live on the installation
    inverterId: { type: String }, // (no separate Device entity)
    type: { type: String },
    panelBrand: { type: String },
    capacityKw: { type: Number },
    commissionDate: { type: String },
    status: { type: String },
  },
  schemaOptions('installations')
);

const SolarInstallation = mongoose.model('SolarInstallation', solarInstallationSchema);

/**
 * Find a single installation by its business id.
 * @returns {Promise<Object|null>} lean plain object, or null when not found.
 */
SolarInstallation.findById = function findById(id) {
  return SolarInstallation.findOne({ id }, PROJECTION).lean();
};

/**
 * Find all installations.
 * @returns {Promise<Array<Object>>} lean plain objects.
 */
SolarInstallation.findAll = function findAll() {
  return SolarInstallation.find({}, PROJECTION).lean();
};

/**
 * Installations belonging to a given substation.
 * @returns {Promise<Array<Object>>} lean plain objects.
 */
SolarInstallation.findBySubstation = function findBySubstation(substationId) {
  return SolarInstallation.find({ substationId }, PROJECTION).lean();
};

/**
 * Find an existing installation that uses any of the given unique identifiers
 * (`id`, `meterId`, `inverterId`). Used to prevent duplicate devices/records.
 * Only the provided (non-empty) identifiers are checked.
 * @param {{id?: string, meterId?: string, inverterId?: string}} identifiers
 * @returns {Promise<Object|null>} the first conflicting installation, or null.
 */
SolarInstallation.findByUniqueIdentifiers = function findByUniqueIdentifiers(identifiers) {
  const clauses = [];
  if (identifiers.id) clauses.push({ id: identifiers.id });
  if (identifiers.meterId) clauses.push({ meterId: identifiers.meterId });
  if (identifiers.inverterId) clauses.push({ inverterId: identifiers.inverterId });
  if (clauses.length === 0) return Promise.resolve(null);

  return SolarInstallation.findOne({ $or: clauses }, PROJECTION).lean();
};

/**
 * Create a new installation and return it as a lean plain object (custom `id`
 * only, no Mongo-internal `_id` / `__v`), matching the GET endpoints' shape.
 * @param {Object} data validated installation fields.
 * @returns {Promise<Object>} the created installation.
 */
SolarInstallation.createInstallation = async function createInstallation(data) {
  const created = await SolarInstallation.create(data);
  return SolarInstallation.findById(created.id);
};

module.exports = SolarInstallation;

