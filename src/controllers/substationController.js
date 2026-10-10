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
 * Optionally, listSubstations supports ?provinceId=... and/or ?districtId=...
 * to filter the collection (individually or combined).
 */

const GridSubstation = require('../models/Gridsubstation');
const District = require('../models/Districs');
const Province = require('../models/Province');
const SolarInstallation = require('../models/SolarInstallaion');

// GET /api/substations
// Optional filters (each independently or together):
//   ?districtId=...  -> substations directly in that district
//   ?provinceId=...  -> substations in any district of that province
// With no filters, all substations are returned.
async function listSubstations(req, res) {
  try {
    const { provinceId, districtId } = req.query;

    // Validate districtId when supplied.
    if (districtId) {
      const district = await District.findById(districtId);
      if (!district) {
        return res.status(404).json({ error: `District ${districtId} not found` });
      }
    }

    // Resolve province -> district ids so we can scope by province.
    let districtIds;
    if (provinceId) {
      const province = await Province.findById(provinceId);
      if (!province) {
        return res.status(404).json({ error: `Province ${provinceId} not found` });
      }
      const districts = await District.findByFilters({ provinceId });
      districtIds = districts.map((d) => d.id);

      // Province with no districts -> explicit empty result.
      if (districtIds.length === 0) {
        return res.status(200).json({ count: 0, data: [] });
      }
    }

    // Combine both filters: a districtId outside the province yields no results.
    let filters;
    if (districtId && districtIds) {
      filters = { districtId: districtIds.includes(districtId) ? districtId : undefined };
      if (!filters.districtId) {
        return res.status(200).json({ count: 0, data: [] });
      }
    } else if (districtId) {
      filters = { districtId };
    } else if (districtIds) {
      filters = { districtIds };
    } else {
      filters = {};
    }

    const substations = await GridSubstation.findByFilters(filters);
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
