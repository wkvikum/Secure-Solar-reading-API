/**
 * SolarInstallaion.js
 *
 * Domain model: SolarInstallation
 * Relationship: SolarInstallation -> belongs to one Grid Substation;
 *               has many Generation Readings
 *
 * IMPORTANT MODELLING RULE:
 *   meterId and inverterId are ATTRIBUTES of the SolarInstallation itself.
 *   There is deliberately NO separate "Device" model.
 *
 * Maps 1:1 to an `installations` entry in seed.json, e.g.
 *   { "id": "INST-0001", "name": "Colombo City Solar Plant 01",
 *     "substationId": "SUB-01", "meterId": "MTR-000001",
 *     "inverterId": "INV-000001", "type": "Rooftop",
 *     "panelBrand": "JinkoSolar", "capacityKw": 344.8,
 *     "commissionDate": "2022-04-03", "status": "active" }
 *
 * NOTE: the file name ("SolarInstallaion") is kept as-is to match the existing
 * project structure. It exports the correctly-named `SolarInstallation` model.
 *
 * Plain JS class (no Mongoose) so it works with the in-memory seed data.
 */

const dataStore = require('./dataStore');

class SolarInstallation {
  constructor({
    id,
    name,
    substationId,
    meterId,
    inverterId,
    type,
    panelBrand,
    capacityKw,
    commissionDate,
    status,
  }) {
    this.id = id;
    this.name = name;
    this.substationId = substationId; // foreign key -> GridSubstation.id
    this.meterId = meterId; // device identifiers live on the installation
    this.inverterId = inverterId; // (no separate Device entity)
    this.type = type;
    this.panelBrand = panelBrand;
    this.capacityKw = capacityKw;
    this.commissionDate = commissionDate;
    this.status = status;
  }

  // Parent grid substation.
  substation() {
    return dataStore.findById('substations', this.substationId);
  }

  // Append-only generation readings for this installation,
  // returned ordered by timestamp ascending.
  readings() {
    return dataStore
      .readingsByInstallation(this.id)
      .slice()
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  // Convenience: the most recent reading (read-only view; readings themselves
  // remain append-only in the separate collection).
  latestReading() {
    const list = this.readings();
    return list.length ? list[list.length - 1] : null;
  }

  static fromSeed(raw) {
    return new SolarInstallation(raw);
  }

  static findById(id) {
    const raw = dataStore.findById('installations', id);
    return raw ? SolarInstallation.fromSeed(raw) : null;
  }

  static findAll() {
    return dataStore.findAll('installations').map(SolarInstallation.fromSeed);
  }

  // Installations belonging to a given substation.
  static findBySubstation(substationId) {
    return dataStore.installationsBySubstation(substationId).map(SolarInstallation.fromSeed);
  }
}

module.exports = SolarInstallation;
