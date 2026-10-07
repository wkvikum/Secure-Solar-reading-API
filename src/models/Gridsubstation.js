/**
 * Gridsubstation.js
 *
 * Mongoose model: GridSubstation
 * Relationship: GridSubstation -> belongs to one District;
 *               has many Solar Installations
 *
 * Backed by the `substations` collection written by src/seed/seedDatabase.js,
 * e.g.
 *   { "_id": ObjectId, "id": "SUB-01", "name": "Colombo City Grid Substation",
 *     "districtId": "DIST-01", "capacityMva": 150, "voltageKv": 132 }
 *
 * NOTE: the file name ("Gridsubstation") is kept as-is to match the existing
 * project structure. It exports the correctly-named `GridSubstation` model.
 *
 * All static lookups now query MongoDB and return Promises resolving to lean
 * plain objects (or null), keeping the same method names used by controllers.
 */

const mongoose = require('mongoose');
const { schemaOptions } = require('./mongooseOptions');

const gridSubstationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    districtId: { type: String, required: true, index: true }, // FK -> District.id
    capacityMva: { type: Number },
    voltageKv: { type: Number },
  },
  schemaOptions('substations')
);

const GridSubstation = mongoose.model('GridSubstation', gridSubstationSchema);

/**
 * Find a single substation by its business id.
 * @returns {Promise<Object|null>} lean plain object, or null when not found.
 */
GridSubstation.findById = function findById(id) {
  return GridSubstation.findOne({ id }).lean();
};

/**
 * Find all substations.
 * @returns {Promise<Array<Object>>} lean plain objects.
 */
GridSubstation.findAll = function findAll() {
  return GridSubstation.find({}).lean();
};

/**
 * Substations belonging to a given district.
 * @returns {Promise<Array<Object>>} lean plain objects.
 */
GridSubstation.findByDistrict = function findByDistrict(districtId) {
  return GridSubstation.find({ districtId }).lean();
};

module.exports = GridSubstation;
