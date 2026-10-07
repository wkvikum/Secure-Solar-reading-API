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
const { schemaOptions } = require('./mongooseOptions');

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
  return SolarInstallation.findOne({ id }).lean();
};

/**
 * Find all installations.
 * @returns {Promise<Array<Object>>} lean plain objects.
 */
SolarInstallation.findAll = function findAll() {
  return SolarInstallation.find({}).lean();
};

/**
 * Installations belonging to a given substation.
 * @returns {Promise<Array<Object>>} lean plain objects.
 */
SolarInstallation.findBySubstation = function findBySubstation(substationId) {
  return SolarInstallation.find({ substationId }).lean();
};

module.exports = SolarInstallation;
