/**
 * Province.js
 *
 * Domain model: Province
 * Relationship: Province -> has many Districts
 *
 * Maps 1:1 to a `provinces` entry in seed.json, e.g.
 *   { "id": "PROV-01", "name": "Western", "capital": "Colombo" }
 *
 * Intentionally implemented as a plain JS class (no Mongoose) so the domain
 * layer works with the in-memory seed data. Later this can be backed by a
 * Mongoose document instead, without changing the controller-facing API.
 */

const dataStore = require('./dataStore');

class Province {
  constructor({ id, name, capital }) {
    this.id = id;
    this.name = name;
    this.capital = capital;
  }

  // Districts that belong to this province (Province -> many Districts).
  districts() {
    return dataStore.districtsByProvince(this.id);
  }

  static fromSeed(raw) {
    return new Province(raw);
  }

  static findById(id) {
    const raw = dataStore.findById('provinces', id);
    return raw ? Province.fromSeed(raw) : null;
  }

  static findAll() {
    return dataStore.findAll('provinces').map(Province.fromSeed);
  }
}

module.exports = Province;
