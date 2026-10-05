/**
 * User.js
 *
 * Domain model: User
 * Relationship: User -> may be assigned to one or more Grid Substations
 *               (optional linkage used later for authorisation scoping)
 *
 * Maps 1:1 to a `users` entry in seed.json, e.g.
 *   { "id": "USER-01", "username": "admin", "fullName": "System Administrator",
 *     "email": "admin@solargrid.lk", "role": "admin",
 *     "passwordHash": "$2a$10$..." }
 *   Some users also include: "assignedSubstationIds": ["SUB-01", "SUB-02"]
 *
 * Kept free of auth logic (no JWT/bcrypt) for now.
 *
 * Plain JS class (no Mongoose) so it works with the in-memory seed data.
 */

const dataStore = require('./dataStore');

class User {
  constructor({ id, username, fullName, email, role, passwordHash, assignedSubstationIds }) {
    this.id = id;
    this.username = username;
    this.fullName = fullName;
    this.email = email;
    this.role = role;
    this.passwordHash = passwordHash;
    // Optional: substations this user is responsible for (not present on all).
    this.assignedSubstationIds = assignedSubstationIds || [];
  }

  // Grid substations assigned to this user.
  assignedSubstations() {
    return this.assignedSubstationIds
      .map((id) => dataStore.findById('substations', id))
      .filter(Boolean);
  }

  static fromSeed(raw) {
    return new User(raw);
  }

  static findById(id) {
    const raw = dataStore.findById('users', id);
    return raw ? User.fromSeed(raw) : null;
  }

  // NOTE: named findByUsername to avoid clashing with a potential instance field.
  static findByUsername(username) {
    const raw = dataStore.findOneBy('users', (u) => u.username === username);
    return raw ? User.fromSeed(raw) : null;
  }

  static findAll() {
    return dataStore.findAll('users').map(User.fromSeed);
  }
}

module.exports = User;

