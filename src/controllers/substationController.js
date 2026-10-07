/**
 * substationController.js
 *
 * Request handling for the GridSubstation resource.
 *
 * Routes (mounted under /api/substations):
 *   GET  /api/substations                              -> listSubstations (collection)
 *   GET  /api/substations/:substationId                -> getSubstationById (individual)
 *   GET  /api/substations/:substationId/installations  -> listSubstationInstallations (nested)
 *
 * Optionally, listSubstations supports ?districtId=... to filter the collection.
 */

const GridSubstation = require('../models/Gridsubstation');
const District = require('../models/Districs');
const SolarInstallation = require('../models/SolarInstallaion');

// GET /api/substations
async function listSubstations(req, res) {
  try {
    const { districtId } = req.query;

    // Optional scoping: filter substations by district query parameter.
    if (districtId) {
      const district = await District.findById(districtId);
      if (!district) {
        return res.status(404).json({ error: `District ${districtId} not found` });
      }
      const substations = await GridSubstation.findByDistrict(districtId);
      return res.status(200).json({ count: substations.length, data: substations });
    }

    const substations = await GridSubstation.findAll();
    return res.status(200).json({ count: substations.length, data: substations });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve substations', details: err.message });
  }
}

// GET /api/substations/:substationId
async function getSubstationById(req, res) {
  try {
    const { substationId } = req.params;

    if (!substationId) {
      return res.status(400).json({ error: 'substationId parameter is required' });
    }

    const substation = await GridSubstation.findById(substationId);
    if (!substation) {
      return res.status(404).json({ error: `Substation ${substationId} not found` });
    }

    return res.status(200).json({ data: substation });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve substation', details: err.message });
  }
}

// GET /api/substations/:substationId/installations  (nested/scoped resource)
async function listSubstationInstallations(req, res) {
  try {
    const { substationId } = req.params;

    if (!substationId) {
      return res.status(400).json({ error: 'substationId parameter is required' });
    }

    const substation = await GridSubstation.findById(substationId);
    if (!substation) {
      return res.status(404).json({ error: `Substation ${substationId} not found` });
    }

    const installations = await SolarInstallation.findBySubstation(substationId);
    return res.status(200).json({ count: installations.length, data: installations });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve installations for substation', details: err.message });
  }
}

module.exports = {
  listSubstations,
  getSubstationById,
  listSubstationInstallations,
};
