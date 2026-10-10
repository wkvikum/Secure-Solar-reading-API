/**
 * substationRoutes.js
 *
 * Express routes for the GridSubstation resource. Request handling is delegated
 * to substationController; this file only wires paths -> controller functions.
 */

const express = require('express');
const router = express.Router();
const substationController = require('../controllers/substationController');

/**
 * @openapi
 * /api/substations:
 *   get:
 *     tags: [Substations]
 *     summary: List grid substations (optionally filtered by province and/or district)
 *     parameters:
 *       - $ref: '#/components/parameters/provinceIdQuery'
 *       - $ref: '#/components/parameters/districtIdQuery'
 *     responses:
 *       200:
 *         description: A list of grid substations.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/CountedList'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/GridSubstation'
 *       404:
 *         description: A supplied provinceId or districtId filter did not match any record.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', substationController.listSubstations);

/**
 * @openapi
 * /api/substations/{substationId}/installations:
 *   get:
 *     tags: [Substations]
 *     summary: List the solar installations of a substation
 *     description: Nested/scoped resource returning all installations on the given substation.
 *     parameters:
 *       - $ref: '#/components/parameters/substationId'
 *     responses:
 *       200:
 *         description: A list of installations for the substation.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/CountedList'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SolarInstallation'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:substationId/installations', substationController.listSubstationInstallations);

/**
 * @openapi
 * /api/substations/{substationId}:
 *   get:
 *     tags: [Substations]
 *     summary: Get a single grid substation by id
 *     parameters:
 *       - $ref: '#/components/parameters/substationId'
 *     responses:
 *       200:
 *         description: The requested grid substation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/GridSubstation'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:substationId', substationController.getSubstationById);

module.exports = router;
