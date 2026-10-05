/**
 * districtRoutes.js
 *
 * Express routes for the District resource. Request handling is delegated to
 * districtController; this file only wires paths -> controller functions.
 */

const express = require('express');
const router = express.Router();
const districtController = require('../controllers/districtController');

// Collection
router.get('/', districtController.listDistricts);

// Nested/scoped resource: substations belonging to a district
router.get('/:districtId/substations', districtController.listDistrictSubstations);

// Individual resource
router.get('/:districtId', districtController.getDistrictById);

module.exports = router;
