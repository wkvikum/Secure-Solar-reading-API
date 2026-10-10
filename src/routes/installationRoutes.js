/**
 * installationRoutes.js
 *
 * Express routes for the SolarInstallation resource. Request handling is
 * delegated to installationController; this file only wires paths -> controller functions.
 */

const express = require('express');
const router = express.Router();
const installationController = require('../controllers/installationController');

/**
 * @openapi
 * /api/installations:
 *   get:
 *     tags: [Installations]
 *     summary: List solar installations (optionally filtered by province, district and/or substation)
 *     parameters:
 *       - $ref: '#/components/parameters/provinceIdQuery'
 *       - $ref: '#/components/parameters/districtIdQuery'
 *       - $ref: '#/components/parameters/substationIdQuery'
 *     responses:
 *       200:
 *         description: A list of solar installations.
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
 *         description: A supplied filter value did not match any record.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     tags: [Installations]
 *     summary: Create a new solar installation
 *     description: >
 *       Creates a new installation. The `status` is always forced to
 *       "maintenance" by the server, regardless of any value supplied.
 *
 *       INTENDED SECURITY: this write operation is meant to require a JWT
 *       (`installation-write` scope) per the project's security model. The API
 *       does NOT enforce this yet, so the security requirement is documented
 *       for planning only.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, substationId, meterId, capacityKw]
 *             properties:
 *               id: { type: string, example: INST-9999 }
 *               name: { type: string, example: New Solar Plant }
 *               substationId: { type: string, example: SUB-01 }
 *               meterId: { type: string, example: MTR-999999 }
 *               inverterId: { type: string, example: INV-999999 }
 *               type: { type: string, example: Rooftop }
 *               panelBrand: { type: string, example: JinkoSolar }
 *               capacityKw: { type: number, example: 120.5 }
 *               commissionDate: { type: string, example: '2026-01-15' }
 *           example:
 *             id: INST-9999
 *             name: New Solar Plant
 *             substationId: SUB-01
 *             meterId: MTR-999999
 *             inverterId: INV-999999
 *             type: Rooftop
 *             panelBrand: JinkoSolar
 *             capacityKw: 120.5
 *             commissionDate: '2026-01-15'
 *     responses:
 *       201:
 *         description: Installation created. A `Location` header points to the new resource.
 *         headers:
 *           Location:
 *             description: URL of the newly created installation.
 *             schema: { type: string, example: /api/installations/INST-9999 }
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/SolarInstallation'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: The referenced substation does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', installationController.listInstallations);
router.post('/', installationController.createInstallation);

/**
 * @openapi
 * /api/installations/{installationId}/readings:
 *   get:
 *     tags: [Installations]
 *     summary: List the generation readings of an installation
 *     description: >
 *       Returns all readings for the installation ordered by timestamp ascending.
 *       This nested endpoint is NOT paginated; use GET /api/readings with the
 *       `installationId` query parameter for a paginated view.
 *     parameters:
 *       - $ref: '#/components/parameters/installationId'
 *     responses:
 *       200:
 *         description: A list of generation readings for the installation.
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
 *                         $ref: '#/components/schemas/GenerationReading'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     tags: [Installations]
 *     summary: Append a generation reading to an installation
 *     description: >
 *       Appends a new (append-only) reading. The `installationId` is taken from
 *       the URL, not the request body, so a client cannot attach a reading to a
 *       different installation.
 *
 *       INTENDED SECURITY: this metering-device write operation is meant to
 *       require a JWT bound to the installation (`installation-write` scope) per
 *       the project's security model. The API does NOT enforce this yet, so the
 *       security requirement is documented for planning only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/installationId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, timestamp, powerKw, cumulativeEnergyKwh, voltage]
 *             properties:
 *               id: { type: string, example: READ-99999999 }
 *               timestamp: { type: string, example: '2026-10-05T10:15:00.000Z' }
 *               powerKw: { type: number, example: 4.82 }
 *               cumulativeEnergyKwh: { type: number, example: 1256.45 }
 *               voltage: { type: number, example: 231.4 }
 *           example:
 *             id: READ-99999999
 *             timestamp: '2026-10-05T10:15:00.000Z'
 *             powerKw: 4.82
 *             cumulativeEnergyKwh: 1256.45
 *             voltage: 231.4
 *     responses:
 *       201:
 *         description: Reading created. A `Location` header points to the new resource.
 *         headers:
 *           Location:
 *             description: URL of the newly created reading.
 *             schema: { type: string, example: /api/installations/INST-0001/readings/READ-99999999 }
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/GenerationReading'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: The parent installation does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:installationId/readings', installationController.listInstallationReadings);
router.post('/:installationId/readings', installationController.createInstallationReading);

/**
 * @openapi
 * /api/installations/{installationId}:
 *   get:
 *     tags: [Installations]
 *     summary: Get a single solar installation by id
 *     parameters:
 *       - $ref: '#/components/parameters/installationId'
 *     responses:
 *       200:
 *         description: The requested installation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/SolarInstallation'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:installationId', installationController.getInstallationById);

module.exports = router;
