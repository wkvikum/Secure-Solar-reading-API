/**
 * readingController.js
 *
 * Request handling for the GenerationReading resource.
 *
 * Routes (mounted under /api/readings):
 *   GET  /api/readings                -> listReadings (collection)
 *   GET  /api/readings/:readingId     -> getReadingById (individual)
 *
 * Optionally, listReadings supports ?installationId=... to scope the collection
 * to a single installation (append-only time-series).
 */

const GenerationReading = require('../models/GenerationReading');
const SolarInstallation = require('../models/SolarInstallaion');

// GET /api/readings
async function listReadings(req, res) {
  try {
    const { installationId } = req.query;

    // Optional scoping: filter readings by installation query parameter.
    if (installationId) {
      const installation = await SolarInstallation.findById(installationId);
      if (!installation) {
        return res.status(404).json({ error: `Installation ${installationId} not found` });
      }
      const readings = await GenerationReading.findByInstallation(installationId);
      return res.status(200).json({ count: readings.length, data: readings });
    }

    const readings = await GenerationReading.findAll();
    return res.status(200).json({ count: readings.length, data: readings });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve readings', details: err.message });
  }
}

// GET /api/readings/:readingId
async function getReadingById(req, res) {
  try {
    const { readingId } = req.params;

    if (!readingId) {
      return res.status(400).json({ error: 'readingId parameter is required' });
    }

    const reading = await GenerationReading.findById(readingId);
    if (!reading) {
      return res.status(404).json({ error: `Reading ${readingId} not found` });
    }

    return res.status(200).json({ data: reading });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve reading', details: err.message });
  }
}

module.exports = {
  listReadings,
  getReadingById,
};
