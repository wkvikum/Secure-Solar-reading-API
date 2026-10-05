/**
 * installationRoutes.js
 *
 * Express routes for the SolarInstallation resource. Request handling is
 * delegated to installationController; this file only wires paths -> controllers.
 */

const express = require('express');
const router = express.Router();
const installationController = require('../controllers/installationController');

// Collection
router.get('/', installationController.listInstallations);

// Nested/scoped resource: readings belonging to an installation
router.get('/:installationId/readings', installationController.listInstallationReadings);

// Individual resource
router.get('/:installationId', installationController.getInstallationById);

module.exports = router;
