/**
 * userController.js
 *
 * Request handling for the User resource.
 *
 * Routes (mounted under /api/users):
 *   GET    /api/users            -> listUsers     (collection)
 *   POST   /api/users            -> createUser    (collection)
 *   GET    /api/users/:userId    -> getUserById   (individual)
 *   DELETE /api/users/:userId    -> deleteUser    (individual)
 *
 * Creation, reading and deletion are implemented; authentication/authorisation
 * is not yet implemented.
 */

const User = require('../models/User');

// GET /api/users
async function listUsers(req, res) {
  try {
    const users = await User.findAll();
    return res.status(200).json({ count: users.length, data: users });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve users', details: err.message });
  }
}

// POST /api/users
async function createUser(req, res) {
  try {
    const { id, name, email, role, roleId, active, passwordHash, assignedSubstationIds } = req.body || {};

    // Required fields.
    if (!id || !name) {
      return res.status(400).json({ error: 'Fields "id" and "name" are required' });
    }

    // Reject duplicates up-front for a clean 409 response.
    const existing = await User.findById(id);
    if (existing) {
      return res.status(409).json({ error: `User ${id} already exists` });
    }

    const created = await User.createUser({
      id,
      name,
      email,
      role,
      roleId,
      // Accept booleans and common string forms ("true"/"false").
      active: typeof active === 'string' ? active.toLowerCase() === 'true' : Boolean(active),
      passwordHash,
      assignedSubstationIds,
    });
    return res.status(201).json({ data: created });
  } catch (err) {
    // Duplicate key error from the unique index.
    if (err.code === 11000) {
      return res.status(409).json({ error: 'User already exists', details: err.message });
    }
    // Mongoose validation error.
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation failed', details: err.message });
    }
    return res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
}

// GET /api/users/:userId
async function getUserById(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId parameter is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: `User ${userId} not found` });
    }

    return res.status(200).json({ data: user });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve user', details: err.message });
  }
}

// DELETE /api/users/:userId
async function deleteUser(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId parameter is required' });
    }

    const user = await User.deleteById(userId);
    if (!user) {
      return res.status(404).json({ error: `User ${userId} not found` });
    }

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete user', details: err.message });
  }
}

module.exports = {
  listUsers,
  createUser,
  getUserById,
  deleteUser,
};

