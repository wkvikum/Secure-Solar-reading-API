/**
 * GenerationReading.js
 *
 * Domain model: GenerationReading
 * Relationship: GenerationReading -> belongs to one SolarInstallation
 *
 * This is a SEPARATE, APPEND-ONLY TIME-SERIES entity. It is NOT embedded inside
 * SolarInstallation (we must not store only the "latest" reading there).
 *
 * Maps 1:1 to a `readings` entry in seed.json, e.g.
 *   { "id": "READ-00000001", "installationId": "INST-0001",
 *     "timestamp": "2026-01-01T00:00:00.000Z",
 *     "powerKw": 0, "cumulativeEnergyKwh": 0, "voltage": 0 }
 *
 * Required measurement fields:
 *   - installationId       reference to SolarInstallation
 *   - timestamp            ISO-8601 timestamp (15-minute interval)
 *   - powerKw              instantaneous power (kW)
 *   - cumulativeEnergyKwh  cumulative energy (kWh)
 *   - voltage              voltage (V)
 *
 * Plain JS class (no Mongoose) so it works with the in-memory seed data.
 */

const dataStore = require('./dataStore');

class GenerationReading {
  constructor({ id, installationId, timestamp, powerKw, cumulativeEnergyKwh, voltage }) {
    this.id = id;
    this.installationId = installationId; // foreign key -> SolarInstallation.id
    this.timestamp = timestamp; // ISO-8601 string
    this.powerKw = powerKw;
    this.cumulativeEnergyKwh = cumulativeEnergyKwh;
    this.voltage = voltage;
  }

  // Parent installation (GenerationReading -> one SolarInstallation).
  installation() {
    return dataStore.findById('installations', this.installationId);
  }

  static fromSeed(raw) {
    return new GenerationReading(raw);
  }

  static findById(id) {
    const raw = dataStore.findById('readings', id);
    return raw ? GenerationReading.fromSeed(raw) : null;
  }

  static findAll() {
    return dataStore.findAll('readings').map(GenerationReading.fromSeed);
  }

  // Readings for a given installation, ordered by timestamp ascending.
  static findByInstallation(installationId) {
    return dataStore
      .readingsByInstallation(installationId)
      .slice()
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(GenerationReading.fromSeed);
  }
}

module.exports = GenerationReading;
