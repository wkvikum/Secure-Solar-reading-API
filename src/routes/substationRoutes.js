/**
 * substationRoutes.js
 *
 * Express routes for the GridSubstation resource. Request handling is delegated
 * to substationController; this file only wires paths -> controller functions.
 */

const express = require('express');
const router = express.Router();
const substationController = require('../controllers/substationController');

// Collection
router.get('/', substationController.listSubstations);

// Nested/scoped resource: installations belonging to a substation
router.get('/:substationId/installations', substationController.listSubstationInstallations);

// Individual resource
router.get('/:substationId', substationController.getSubstationById);

module.exports = router;
