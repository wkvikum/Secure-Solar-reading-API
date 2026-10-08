/**
 * userController.js
 *
 * Request handling for the User resource.
 *
 * Routes (mounted under /api/users):
 *   GET  /api/users            -> listUsers     (collection)
 *   GET  /api/users/:userId    -> getUserById   (individual)
 *
 * Read-only for now; authentication/authorisation is not yet implemented.
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

module.exports = {
  listUsers,
  getUserById,
};
