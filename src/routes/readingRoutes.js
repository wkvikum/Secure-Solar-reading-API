/**
 * readingRoutes.js
 *
 * Express routes for the GenerationReading resource. Request handling is
 * delegated to readingController; this file only wires paths -> controllers.
 */

const express = require('express');
const router = express.Router();
const readingController = require('../controllers/readingController');

// Collection
router.get('/', readingController.listReadings);

// Individual resource
router.get('/:readingId', readingController.getReadingById);

module.exports = router;
