/**
 * routes/index.js
 *
 * Aggregates all resource routers under a single API router.
 * Mounted in the app entry point (index.js) at /api.
 */

const express = require('express');
const router = express.Router();

const provinceRoutes = require('./provinceRoutes');
const districtRoutes = require('./districtRoutes');
const substationRoutes = require('./substationRoutes');
const installationRoutes = require('./installationRoutes');
const readingRoutes = require('./readingRoutes');

router.use('/provinces', provinceRoutes);
router.use('/districts', districtRoutes);
router.use('/substations', substationRoutes);
router.use('/installations', installationRoutes);
router.use('/readings', readingRoutes);

module.exports = router;
