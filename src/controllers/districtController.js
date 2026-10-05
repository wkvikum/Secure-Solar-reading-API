/**
 * districtController.js
 *
 * Request handling for the District resource.
 *
 * Routes (mounted under /api/districts):
 *   GET  /api/districts                          -> listDistricts     (collection)
 *   GET  /api/districts/:districtId              -> getDistrictById   (individual)
 *   GET  /api/districts/:districtId/substations  -> listDistrictSubstations (nested)
 *
 * Optionally, listDistricts supports ?provinceId=... to filter the collection.
 */

const District = require('../models/Districs');
const Province = require('../models/Province');
const GridSubstation = require('../models/Gridsubstation');

// GET /api/districts
function listDistricts(req, res) {
  try {
    const { provinceId } = req.query;

    // Optional scoping: filter districts by province query parameter.
    if (provinceId) {
      const province = Province.findById(provinceId);
      if (!province) {
        return res.status(404).json({ error: `Province ${provinceId} not found` });
      }
      const districts = District.findByProvince(provinceId);
      return res.status(200).json({ count: districts.length, data: districts });
    }

    const districts = District.findAll();
    return res.status(200).json({ count: districts.length, data: districts });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve districts', details: err.message });
  }
}

// GET /api/districts/:districtId
function getDistrictById(req, res) {
  try {
    const { districtId } = req.params;

    if (!districtId) {
      return res.status(400).json({ error: 'districtId parameter is required' });
    }

    const district = District.findById(districtId);
    if (!district) {
      return res.status(404).json({ error: `District ${districtId} not found` });
    }

    return res.status(200).json({ data: district });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve district', details: err.message });
  }
}

// GET /api/districts/:districtId/substations  (nested/scoped resource)
function listDistrictSubstations(req, res) {
  try {
    const { districtId } = req.params;

    if (!districtId) {
      return res.status(400).json({ error: 'districtId parameter is required' });
    }

    const district = District.findById(districtId);
    if (!district) {
      return res.status(404).json({ error: `District ${districtId} not found` });
    }

    const substations = GridSubstation.findByDistrict(districtId);
    return res.status(200).json({ count: substations.length, data: substations });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve substations for district', details: err.message });
  }
}

module.exports = {
  listDistricts,
  getDistrictById,
  listDistrictSubstations,
};
