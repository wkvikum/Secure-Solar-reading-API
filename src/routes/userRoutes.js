/**
 * userRoutes.js
 *
 * Express routes for the User resource. Request handling is delegated to
 * userController; this file only wires paths -> controllers.
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Collection
router.get('/', userController.listUsers);
router.post('/', userController.createUser);

// Individual resource
router.get('/:userId', userController.getUserById);
router.delete('/:userId', userController.deleteUser);

module.exports = router;


