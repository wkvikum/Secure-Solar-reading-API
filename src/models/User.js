/**
 * User.js
 *
 * Mongoose model: User
 * Relationship: User -> may be assigned to one or more Grid Substations
 *               (optional linkage used later for authorisation scoping)
 *
 * Backed by the `users` collection, e.g.
 *   { "_id": ObjectId, "id": "USER-01", "email": "admin@solargrid.lk",
 *     "role": "admin", "roleId": "national", "name": "admin",
 *     "active": true, "passwordHash": "$2a$10$..." }
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
    name: { type: String, required: true },
    email: { type: String },
    role: { type: String }, // e.g. "admin", "operator"
    passwordHash: { type: String }, // stored credential; not validated here yet
    roleId: { type: String }, // access scope, e.g. "national" or "PROV-01"
    active: { type: Boolean }, // whether the account is enabled
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
 * Find a single user by email (used later for authentication).
 * @returns {Promise<Object|null>} lean plain object, or null when not found.
 */
User.findByEmail = function findByEmail(email) {
  return User.findOne({ email }, PROJECTION).lean();
};

/**
 * Find all users.
 * @returns {Promise<Array<Object>>} lean plain objects.
 */
User.findAll = function findAll() {
  return User.find({}, PROJECTION).lean();
};

/**
 * Create a new user.
 * @param {Object} data User fields (id, name, email, role, roleId, active,
 *   passwordHash, and optional assignedSubstationIds).
 * @returns {Promise<Object>} the created lean plain object.
 */
User.createUser = function createUser(data) {
  return User.create(data).then((doc) => {
    const obj = doc.toObject();
    delete obj._id;
    delete obj.__v;
    return obj;
  });
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

