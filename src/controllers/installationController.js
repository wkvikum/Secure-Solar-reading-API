/**
 * installationController.js
 *
 * Request handling for the SolarInstallation resource.
 *
 * Routes (mounted under /api/installations):
 *   GET  /api/installations                          -> listInstallations (collection)
 *   GET  /api/installations/:installationId          -> getInstallationById (individual)
 *   GET  /api/installations/:installationId/readings -> listInstallationReadings (nested)
 *
 * Optionally, listInstallations supports ?substationId=... to filter the collection.
 */

const SolarInstallation = require('../models/SolarInstallaion');
const GridSubstation = require('../models/Gridsubstation');
const GenerationReading = require('../models/GenerationReading');

// GET /api/installations
function listInstallations(req, res) {
  try {
    const { substationId } = req.query;

    // Optional scoping: filter installations by substation query parameter.
    if (substationId) {
      const substation = GridSubstation.findById(substationId);
      if (!substation) {
        return res.status(404).json({ error: `Substation ${substationId} not found` });
      }
      const installations = SolarInstallation.findBySubstation(substationId);
      return res.status(200).json({ count: installations.length, data: installations });
    }

    const installations = SolarInstallation.findAll();
    return res.status(200).json({ count: installations.length, data: installations });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve installations', details: err.message });
  }
}

// GET /api/installations/:installationId
function getInstallationById(req, res) {
  try {
    const { installationId } = req.params;

    if (!installationId) {
      return res.status(400).json({ error: 'installationId parameter is required' });
    }

    const installation = SolarInstallation.findById(installationId);
    if (!installation) {
      return res.status(404).json({ error: `Installation ${installationId} not found` });
    }

    return res.status(200).json({ data: installation });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve installation', details: err.message });
  }
}

// GET /api/installations/:installationId/readings  (nested/scoped resource)
function listInstallationReadings(req, res) {
  try {
    const { installationId } = req.params;

    if (!installationId) {
      return res.status(400).json({ error: 'installationId parameter is required' });
    }

    const installation = SolarInstallation.findById(installationId);
    if (!installation) {
      return res.status(404).json({ error: `Installation ${installationId} not found` });
    }

    const readings = GenerationReading.findByInstallation(installationId);
    return res.status(200).json({ count: readings.length, data: readings });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve readings for installation', details: err.message });
  }
}

module.exports = {
  listInstallations,
  getInstallationById,
  listInstallationReadings,
};
