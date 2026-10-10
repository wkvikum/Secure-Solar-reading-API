/**
 * provinceRoutes.js
 *
 * Express routes for the Province resource. All request handling is delegated
 * to provinceController; this file only wires paths -> controller functions.
 */

const express = require('express');
const router = express.Router();
const provinceController = require('../controllers/provinceController');

/**
 * @openapi
 * /api/provinces:
 *   get:
 *     tags: [Provinces]
 *     summary: List all provinces
 *     description: Returns every province in the system.
 *     responses:
 *       200:
 *         description: A list of provinces.
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
 *                         $ref: '#/components/schemas/Province'
 *             example:
 *               count: 1
 *               data:
 *                 - id: PROV-01
 *                   name: Western
 *                   capital: Colombo
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', provinceController.listProvinces);

/**
 * @openapi
 * /api/provinces/{provinceId}/districts:
 *   get:
 *     tags: [Provinces]
 *     summary: List the districts of a province
 *     description: Nested/scoped resource returning all districts belonging to the given province.
 *     parameters:
 *       - $ref: '#/components/parameters/provinceId'
 *     responses:
 *       200:
 *         description: A list of districts for the province.
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
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:provinceId/districts', provinceController.listProvinceDistricts);

/**
 * @openapi
 * /api/provinces/{provinceId}:
 *   get:
 *     tags: [Provinces]
 *     summary: Get a single province by id
 *     parameters:
 *       - $ref: '#/components/parameters/provinceId'
 *     responses:
 *       200:
 *         description: The requested province.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Province'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:provinceId', provinceController.getProvinceById);

module.exports = router;
