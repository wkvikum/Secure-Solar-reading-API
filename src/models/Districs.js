/**
 * Districs.js
 *
 * Domain model: District
 * Relationship: District -> belongs to one Province; has many Grid Substations
 *
 * Maps 1:1 to a `districts` entry in seed.json, e.g.
 *   { "id": "DIST-01", "name": "Colombo", "provinceId": "PROV-01" }
 *
 * NOTE: the file name ("Districs") is kept as-is to match the existing project
 * structure and avoid breaking references. It exports the correctly-named
 * `District` domain model for the coursework.
 *
 * Plain JS class (no Mongoose) so it works with the in-memory seed data.
 */

const dataStore = require('./dataStore');

class District {
  constructor({ id, name, provinceId }) {
    this.id = id;
    this.name = name;
    this.provinceId = provinceId; // foreign key -> Province.id
  }

  // Parent province (District -> one Province).
  province() {
    return dataStore.findById('provinces', this.provinceId);
  }

  // Grid substations in this district (District -> many Grid Substations).
  substations() {
    return dataStore.substationsByDistrict(this.id);
  }

  static fromSeed(raw) {
    return new District(raw);
  }

  static findById(id) {
    const raw = dataStore.findById('districts', id);
    return raw ? District.fromSeed(raw) : null;
  }

  static findAll() {
    return dataStore.findAll('districts').map(District.fromSeed);
  }

  // Districts belonging to a given province.
  static findByProvince(provinceId) {
    return dataStore.districtsByProvince(provinceId).map(District.fromSeed);
  }
}

module.exports = District;
