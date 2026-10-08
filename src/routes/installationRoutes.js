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
router.post('/', installationController.createInstallation);

// Nested/scoped resource: readings belonging to an installation
router.get('/:installationId/readings', installationController.listInstallationReadings);

// Create a new (append-only) reading for an installation
router.post('/:installationId/readings', installationController.createInstallationReading);

// Individual resource
router.get('/:installationId', installationController.getInstallationById);

module.exports = router;

