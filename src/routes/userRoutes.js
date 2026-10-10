/**
 * userRoutes.js
 *
 * Express routes for the User resource. Request handling is delegated to
 * userController; this file only wires paths -> controller functions.
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List all users
 *     responses:
 *       200:
 *         description: A list of users.
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
 *                         $ref: '#/components/schemas/User'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     description: >
 *       INTENDED SECURITY: user administration is meant to be restricted to
 *       authorised SLSEA users (admin scope). The API does NOT enforce this yet,
 *       so the security requirement is documented for planning only.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, name, role, roleId]
 *             properties:
 *               id: { type: string, example: USER-02 }
 *               name: { type: string, example: operator }
 *               email: { type: string, format: email, example: operator@solargrid.lk }
 *               role: { type: string, example: operator }
 *               roleId: { type: string, example: PROV-01 }
 *               active: { type: boolean, example: true }
 *               passwordHash: { type: string, example: '$2a$10$...' }
 *               assignedSubstationIds:
 *                 type: array
 *                 items: { type: string }
 *                 example: [SUB-01, SUB-02]
 *           example:
 *             id: USER-02
 *             name: operator
 *             email: operator@solargrid.lk
 *             role: operator
 *             roleId: PROV-01
 *             active: true
 *     responses:
 *       201:
 *         description: User created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', userController.listUsers);
router.post('/', userController.createUser);

/**
 * @openapi
 * /api/users/{userId}:
 *   get:
 *     tags: [Users]
 *     summary: Get a single user by id
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     responses:
 *       200:
 *         description: The requested user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user by id
 *     description: >
 *       INTENDED SECURITY: user administration is meant to be restricted to
 *       authorised SLSEA users (admin scope). The API does NOT enforce this yet,
 *       so the security requirement is documented for planning only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     responses:
 *       204:
 *         description: User deleted. No response body.
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:userId', userController.getUserById);
router.delete('/:userId', userController.deleteUser);

module.exports = router;
