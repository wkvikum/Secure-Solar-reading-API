/**
 * dataStore.js
 *
 * Lightweight in-memory data access layer for the Solar Generation Data API.
 *
 * Purpose:
 *   - Loads the generated seed data (src/seed/seed.json) once into memory.
 *   - Exposes simple collection accessors used by the domain models and (later)
 *     by controllers.
 *   - Deliberately avoids Mongoose / MongoDB so the domain layer can be built
 *     and tested first. The same accessor shape can later be re-implemented on
 *     top of Mongoose without changing controller code.
 *
 * Collections mirror the seed.json top-level keys:
 *   provinces, districts, substations, installations, readings, users
 */

const seed = require('../seed/seed.json');

// Shallow-copy the arrays so callers cannot accidentally mutate the imported
// module cache of seed.json.
const store = {
  provinces: [...seed.provinces],
  districts: [...seed.districts],
  substations: [...seed.substations],
  installations: [...seed.installations],
  readings: [...seed.readings],
  users: [...seed.users],
};

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

function findById(collection, id) {
  return store[collection].find((item) => item.id === id) || null;
}

function findAll(collection) {
  return store[collection];
}

function findBy(collection, predicate) {
  return store[collection].filter(predicate);
}

function findOneBy(collection, predicate) {
  return store[collection].find(predicate) || null;
}

// ---------------------------------------------------------------------------
// Relationship helpers (mirror the domain relationships)
// ---------------------------------------------------------------------------

// Province -> many Districts
function districtsByProvince(provinceId) {
  return store.districts.filter((d) => d.provinceId === provinceId);
}

// District -> many Grid Substations
function substationsByDistrict(districtId) {
  return store.substations.filter((s) => s.districtId === districtId);
}

// Grid Substation -> many Solar Installations
function installationsBySubstation(substationId) {
  return store.installations.filter((i) => i.substationId === substationId);
}

// Solar Installation -> many Generation Readings (append-only time series)
function readingsByInstallation(installationId) {
  return store.readings.filter((r) => r.installationId === installationId);
}

module.exports = {
  store,
  findById,
  findAll,
  findBy,
  findOneBy,
  districtsByProvince,
  substationsByDistrict,
  installationsBySubstation,
  readingsByInstallation,
};
