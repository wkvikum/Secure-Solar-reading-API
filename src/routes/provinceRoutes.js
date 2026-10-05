/**
 * provinceRoutes.js
 *
 * Express routes for the Province resource. All request handling is delegated
 * to provinceController; this file only wires paths -> controller functions.
 */

const express = require('express');
const router = express.Router();
const provinceController = require('../controllers/provinceController');

// Collection
router.get('/', provinceController.listProvinces);

// Nested/scoped resource: districts belonging to a province
router.get('/:provinceId/districts', provinceController.listProvinceDistricts);

// Individual resource
router.get('/:provinceId', provinceController.getProvinceById);

module.exports = router;
