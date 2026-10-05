/**
 * Gridsubstation.js
 *
 * Domain model: GridSubstation
 * Relationship: GridSubstation -> belongs to one District;
 *               has many Solar Installations
 *
 * Maps 1:1 to a `substations` entry in seed.json, e.g.
 *   { "id": "SUB-01", "name": "Colombo City Grid Substation",
 *     "districtId": "DIST-01", "capacityMva": 150, "voltageKv": 132 }
 *
 * NOTE: the file name ("Gridsubstation") is kept as-is to match the existing
 * project structure. It exports the correctly-named `GridSubstation` model.
 *
 * Plain JS class (no Mongoose) so it works with the in-memory seed data.
 */

const dataStore = require('./dataStore');

class GridSubstation {
  constructor({ id, name, districtId, capacityMva, voltageKv }) {
    this.id = id;
    this.name = name;
    this.districtId = districtId; // foreign key -> District.id
    this.capacityMva = capacityMva;
    this.voltageKv = voltageKv;
  }

  // Parent district (GridSubstation -> one District).
  district() {
    return dataStore.findById('districts', this.districtId);
  }

  // Solar installations connected to this substation.
  installations() {
    return dataStore.installationsBySubstation(this.id);
  }

  static fromSeed(raw) {
    return new GridSubstation(raw);
  }

  static findById(id) {
    const raw = dataStore.findById('substations', id);
    return raw ? GridSubstation.fromSeed(raw) : null;
  }

  static findAll() {
    return dataStore.findAll('substations').map(GridSubstation.fromSeed);
  }

  // Substations belonging to a given district.
  static findByDistrict(districtId) {
    return dataStore.substationsByDistrict(districtId).map(GridSubstation.fromSeed);
  }
}

module.exports = GridSubstation;
