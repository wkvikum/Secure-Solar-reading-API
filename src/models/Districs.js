/**
 * Districs.js
 *
 * Mongoose model: District
 * Relationship: District -> belongs to one Province; has many Grid Substations
 *
 * Backed by the `districts` collection written by src/seed/seedDatabase.js,
 * e.g.
 *   { "_id": ObjectId, "id": "DIST-01", "name": "Colombo", "provinceId": "PROV-01" }
 *
 * NOTE: the file name ("Districs") is kept as-is to match the existing project
 * structure and avoid breaking references. It exports the correctly-named
 * `District` Mongoose model for the coursework.
 *
 * All static lookups now query MongoDB and return Promises resolving to lean
 * plain objects (or null), keeping the same method names used by controllers.
 */

const mongoose = require('mongoose');
const { schemaOptions, PROJECTION } = require('./mongooseOptions');

const districtSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    provinceId: { type: String, required: true, index: true }, // FK -> Province.id
  },
  schemaOptions('districts')
);

const District = mongoose.model('District', districtSchema);

/**
 * Find a single district by its business id.
 * @returns {Promise<Object|null>} lean plain object, or null when not found.
 */
District.findById = function findById(id) {
  return District.findOne({ id }, PROJECTION).lean();
};

/**
 * Find all districts.
 * @returns {Promise<Array<Object>>} lean plain objects.
 */
District.findAll = function findAll() {
  return District.find({}, PROJECTION).lean();
};

/**
 * Districts belonging to a given province.
 * @returns {Promise<Array<Object>>} lean plain objects.
 */
District.findByProvince = function findByProvince(provinceId) {
  return District.find({ provinceId }, PROJECTION).lean();
};

module.exports = District;
