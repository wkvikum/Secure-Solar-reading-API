/**
 * mongooseOptions.js
 *
 * Shared, monotonic defaults applied to every Mongoose schema in this project.
 *
 * The seed data was inserted into MongoDB as RAW documents (via the native
 * driver) that already contain a custom string `id` field (e.g. "PROV-01",
 * "INST-0001") plus an auto-generated Mongo `_id`. To keep the API response
 * shape identical to what the previous in-memory data layer returned, every
 * schema:
 *   - uses the persisted custom `id` instead of the ObjectId `_id` virtual,
 *   - strips Mongo-internal `_id` / `__v` keys from JSON output.
 */

/**
 * Build the common schema options object.
 *
 * @param {string} collectionName Explicit MongoDB collection name (matches the
 *   collections written by src/seed/seedDatabase.js).
 * @returns {Object} Mongoose SchemaOptions.
 */
function schemaOptions(collectionName) {
  return {
    collection: collectionName,
    // The stored documents already have their own `id`; don't let Mongoose
    // synthesise/override an `id` virtual from `_id`.
    id: false,
    versionKey: false,
    // Expose only the persisted business fields, never Mongo internals.
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  };
}

/**
 * Shared projection used by every `.lean()` read query.
 *
 * `.lean()` returns plain JS objects and therefore BYPASSES the schema's
 * `toJSON` transform, which means the Mongo-internal `_id` would otherwise leak
 * into API responses. Excluding it here keeps the response shape identical to
 * the previous in-memory data layer (custom `id` only, no `_id` / `__v`).
 *
 * It must be spread into each query, e.g. `Model.find(filter, PROJECTION)`.
 */
const PROJECTION = { _id: 0, __v: 0 };

module.exports = { schemaOptions, PROJECTION };
