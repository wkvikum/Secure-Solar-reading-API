/**
 * districtRoutes.js
 *
 * Express routes for the District resource. Request handling is delegated to
 * districtController; this file only wires paths -> controller functions.
 */

const express = require('express');
const router = express.Router();
const districtController = require('../controllers/districtController');

/**
 * @openapi
 * /api/districts:
 *   get:
 *     tags: [Districts]
 *     summary: List districts (optionally filtered by province)
 *     parameters:
 *       - $ref: '#/components/parameters/provinceIdQuery'
 *     responses:
 *       200:
 *         description: A list of districts.
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
 *                         $ref: '#/components/schemas/District'
 *       404:
 *         description: The province filter value did not match any province.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', districtController.listDistricts);

/**
 * @openapi
 * /api/districts/{districtId}/substations:
 *   get:
 *     tags: [Districts]
 *     summary: List the grid substations of a district
 *     description: Nested/scoped resource returning all substations in the given district.
 *     parameters:
 *       - $ref: '#/components/parameters/districtId'
 *     responses:
 *       200:
 *         description: A list of substations for the district.
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
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:districtId/substations', districtController.listDistrictSubstations);

/**
 * @openapi
 * /api/districts/{districtId}:
 *   get:
 *     tags: [Districts]
 *     summary: Get a single district by id
 *     parameters:
 *       - $ref: '#/components/parameters/districtId'
 *     responses:
 *       200:
 *         description: The requested district.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/District'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:districtId', districtController.getDistrictById);

module.exports = router;
