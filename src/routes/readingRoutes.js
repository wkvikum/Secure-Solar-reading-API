/**
 * readingRoutes.js
 *
 * Express routes for the GenerationReading resource. Request handling is
 * delegated to readingController; this file only wires paths -> controller functions.
 */

const express = require('express');
const router = express.Router();
const readingController = require('../controllers/readingController');

/**
 * @openapi
 * /api/readings:
 *   get:
 *     tags: [Readings]
 *     summary: List generation readings (paginated, or scoped to an installation)
 *     description: >
 *       Without filters, returns a paginated slice of the global readings
 *       collection using `page` and `limit`. When `installationId` is supplied,
 *       returns ALL readings for that installation (not paginated).
 *     parameters:
 *       - $ref: '#/components/parameters/installationIdQuery'
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *     responses:
 *       200:
 *         description: >
 *           A paginated readings payload when unfiltered, or the full
 *           installation readings list (with `count`/`data`) when `installationId`
 *           is supplied.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/PaginatedReadings'
 *                 - allOf:
 *                     - $ref: '#/components/schemas/CountedList'
 *                     - type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/GenerationReading'
 *             examples:
 *               paginated:
 *                 value:
 *                   count: 20
 *                   data: []
 *                   totalCount: 120000
 *                   totalPages: 6000
 *                   currentPage: 1
 *                   nextPage: 2
 *                   previousPage: null
 *               scopedToInstallation:
 *                 value:
 *                   count: 168
 *                   data: []
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: The installationId filter did not match any installation.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', readingController.listReadings);

/**
 * @openapi
 * /api/readings/{readingId}:
 *   get:
 *     tags: [Readings]
 *     summary: Get a single generation reading by id
 *     parameters:
 *       - $ref: '#/components/parameters/readingId'
 *     responses:
 *       200:
 *         description: The requested reading.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/GenerationReading'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:readingId', readingController.getReadingById);

module.exports = router;
