/**
 * User.js
 *
 * Mongoose model: User
 * Relationship: User -> may be assigned to one or more Grid Substations
 *               (optional linkage used later for authorisation scoping)
 *
 * Backed by the `users` collection, e.g.
 *   { "_id": ObjectId, "id": "USER-01", "username": "admin",
 *     "fullName": "System Administrator", "email": "admin@solargrid.lk",
 *     "role": "admin", "passwordHash": "$2a$10$...", "roleId": "national" }
 *   Some users also include: "assignedSubstationIds": ["SUB-01", "SUB-02"]
 *
 * `roleId` carries the access scope for the user, e.g. "national" (SLSEA HQ)
 * or a province id ("PROV-01"). Kept free of auth logic (no JWT/bcrypt
 * validation) for now.
 *
 * All static lookups query MongoDB and return Promises resolving to lean plain
 * objects (or null), keeping the same method names used by controllers.
 */

const mongoose = require('mongoose');
const { schemaOptions, PROJECTION } = require('./mongooseOptions');

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true },
    fullName: { type: String },
    email: { type: String },
    role: { type: String }, // e.g. "admin", "operator"
    passwordHash: { type: String }, // stored credential; not validated here yet
    roleId: { type: String }, // access scope, e.g. "national" or "PROV-01"
    assignedSubstationIds: { type: [String], default: undefined }, // optional scoping
  },
  schemaOptions('users')
);

const User = mongoose.model('User', userSchema);

/**
 * Find a single user by its business id.
 * @returns {Promise<Object|null>} lean plain object, or null when not found.
 */
User.findById = function findById(id) {
  return User.findOne({ id }, PROJECTION).lean();
};

/**
 * Find a single user by username (used later for authentication).
 * @returns {Promise<Object|null>} lean plain object, or null when not found.
 */
User.findByUsername = function findByUsername(username) {
  return User.findOne({ username }, PROJECTION).lean();
};

/**
 * Find all users.
 * @returns {Promise<Array<Object>>} lean plain objects.
 */
User.findAll = function findAll() {
  return User.find({}, PROJECTION).lean();
};

/**
 * Delete a single user by its business id.
 * @returns {Promise<Object|null>} the deleted lean plain object, or null when
 *   no user with that id existed.
 */
User.deleteById = function deleteById(id) {
  // Pass PROJECTION as the query options projection so Mongo `_id` / `__v` are
  // stripped from the returned document, matching the other lean read queries.
  return User.findOneAndDelete({ id }, { projection: PROJECTION }).lean();
};

module.exports = User;


