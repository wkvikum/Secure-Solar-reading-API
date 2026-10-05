/**
 * provinceController.js
 *
 * Request handling for the Province resource.
 *
 * Routes (mounted under /api/provinces):
 *   GET  /api/provinces                        -> listProvinces   (collection)
 *   GET  /api/provinces/:provinceId            -> getProvinceById (individual)
 *   GET  /api/provinces/:provinceId/districts  -> listProvinceDistricts (nested)
 *
 * Responsibilities:
 *   - receive req/res
 *   - validate required route parameters
 *   - delegate to the existing Province model
 *   - return JSON responses with appropriate HTTP status codes
 *   - handle errors consistently (404 for missing, 500 for unexpected)
 */

const Province = require('../models/Province');
const District = require('../models/Districs');

// GET /api/provinces
function listProvinces(req, res) {
  try {
    const provinces = Province.findAll();
    return res.status(200).json({ count: provinces.length, data: provinces });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve provinces', details: err.message });
  }
}

// GET /api/provinces/:provinceId
function getProvinceById(req, res) {
  try {
    const { provinceId } = req.params;

    if (!provinceId) {
      return res.status(400).json({ error: 'provinceId parameter is required' });
    }

    const province = Province.findById(provinceId);
    if (!province) {
      return res.status(404).json({ error: `Province ${provinceId} not found` });
    }

    return res.status(200).json({ data: province });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve province', details: err.message });
  }
}

// GET /api/provinces/:provinceId/districts  (nested/scoped resource)
function listProvinceDistricts(req, res) {
  try {
    const { provinceId } = req.params;

    if (!provinceId) {
      return res.status(400).json({ error: 'provinceId parameter is required' });
    }

    const province = Province.findById(provinceId);
    if (!province) {
      return res.status(404).json({ error: `Province ${provinceId} not found` });
    }

    const districts = District.findByProvince(provinceId);
    return res.status(200).json({ count: districts.length, data: districts });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve districts for province', details: err.message });
  }
}

module.exports = {
  listProvinces,
  getProvinceById,
  listProvinceDistricts,
};
