/**
 * Province.js
 *
 * Mongoose model: Province
 * Relationship: Province -> has many Districts
 *
 * Backed by the `provinces` collection written by src/seed/seedDatabase.js,
 * e.g.
 *   { "_id": ObjectId, "id": "PROV-01", "name": "Western", "capital": "Colombo" }
 *
 * The persisted custom `id` field (not the Mongo ObjectId) is exposed as `id`
 * so the JSON response shape matches the previous in-memory data layer.
 *
 * All static lookups now query MongoDB and return Promises resolving to lean
 * plain objects (or null), keeping the same method names used by controllers.
 */

const mongoose = require('mongoose');
const { schemaOptions } = require('./mongooseOptions');

const provinceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    capital: { type: String, required: true },
  },
  schemaOptions('provinces')
);

const Province = mongoose.model('Province', provinceSchema);

/**
 * Find a single province by its business id.
 * @returns {Promise<Object|null>} lean plain object, or null when not found.
 */
Province.findById = function findById(id) {
  return Province.findOne({ id }).lean();
};

/**
 * Find all provinces.
 * @returns {Promise<Array<Object>>} lean plain objects.
 */
Province.findAll = function findAll() {
  return Province.find({}).lean();
};

module.exports = Province;
