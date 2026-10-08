/**
 * installationController.js
 *
 * Request handling for the SolarInstallation resource.
 *
 * Routes (mounted under /api/installations):
 *   GET  /api/installations                          -> listInstallations (collection)
 *   GET  /api/installations/:installationId          -> getInstallationById (individual)
 *   GET  /api/installations/:installationId/readings -> listInstallationReadings (nested)
 *   POST /api/installations/:installationId/readings -> createInstallationReading (nested)
 *   POST /api/installations                          -> createInstallation (collection)
 *
 * Optionally, listInstallations supports ?substationId=... to filter the collection.
 */

const SolarInstallation = require('../models/SolarInstallaion');
const GridSubstation = require('../models/Gridsubstation');
const GenerationReading = require('../models/GenerationReading');

// Fields required to create a GenerationReading. `installationId` is taken from
// the URL, so it is not required in the request body.
const REQUIRED_READING_FIELDS = ['id', 'timestamp', 'powerKw', 'cumulativeEnergyKwh', 'voltage'];

// Fields required to create a SolarInstallation (matches the model's required
// schema fields). `id`, `name` and `substationId` are mandatory; the remaining
// attributes (meterId, inverterId, type, panelBrand, capacityKw, ...) are optional.
const REQUIRED_INSTALLATION_FIELDS = ['id', 'name', 'substationId'];

// Identifier fields that must stay unique across installations: the business id
// plus the physical device identifiers owned by the installation.
const UNIQUE_INSTALLATION_FIELDS = ['id', 'meterId', 'inverterId'];

// GET /api/installations
async function listInstallations(req, res) {
  try {
    const { substationId } = req.query;

    // Optional scoping: filter installations by substation query parameter.
    if (substationId) {
      const substation = await GridSubstation.findById(substationId);
      if (!substation) {
        return res.status(404).json({ error: `Substation ${substationId} not found` });
      }
      const installations = await SolarInstallation.findBySubstation(substationId);
      return res.status(200).json({ count: installations.length, data: installations });
    }

    const installations = await SolarInstallation.findAll();
    return res.status(200).json({ count: installations.length, data: installations });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve installations', details: err.message });
  }
}

// POST /api/installations  (collection)
async function createInstallation(req, res) {
  try {
    // 1. Validate the request body exists and is a JSON object.
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ error: 'Request body must be a JSON object' });
    }

    // 2. Validate that all required installation fields are present.
    const missingFields = REQUIRED_INSTALLATION_FIELDS.filter(
      (field) => body[field] === undefined || body[field] === null || body[field] === ''
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required installation fields',
        missingFields,
      });
    }

    // 3. Prevent duplicate identifiers (id / meterId / inverterId). The model's
    //    unique index on `id` is the final safeguard, but meterId/inverterId are
    //    not index-enforced, so we check all three explicitly here.
    const duplicateFields = [];
    for (const field of UNIQUE_INSTALLATION_FIELDS) {
      const value = body[field];
      if (value === undefined || value === null || value === '') continue;
      const conflict = await SolarInstallation.findByUniqueIdentifiers({ [field]: value });
      if (conflict) duplicateFields.push(field);
    }
    if (duplicateFields.length > 0) {
      return res.status(400).json({
        error: 'Duplicate installation identifier(s)',
        duplicateFields: duplicateFields.map((field) => (field === 'id' ? 'id' : field)),
      });
    }

    // 4. Validate the referenced substation exists (referential integrity).
    const substation = await GridSubstation.findById(body.substationId);
    if (!substation) {
      return res.status(404).json({ error: `Substation ${body.substationId} not found` });
    }

    // 5. Build the installation, keeping only known schema fields so unexpected
    //    client input cannot be persisted.
    const installationData = {
      id: body.id,
      name: body.name,
      substationId: body.substationId,
      meterId: body.meterId,
      inverterId: body.inverterId,
      type: body.type,
      panelBrand: body.panelBrand,
      capacityKw: body.capacityKw,
      commissionDate: body.commissionDate,
      status: body.status,
    };

    // 6. Save to MongoDB and return the created resource.
    const installation = await SolarInstallation.createInstallation(installationData);

    // 7. 201 Created + Location header pointing at the new resource.
    return res
      .status(201)
      .location(`/api/installations/${installation.id}`)
      .json({ data: installation });
  } catch (err) {
    // A duplicate business `id` violates the unique index -> 400 (client error).
    if (err && err.code === 11000) {
      return res.status(400).json({ error: 'An installation with this id already exists' });
    }
    return res.status(500).json({ error: 'Failed to create installation', details: err.message });
  }
}

// GET /api/installations/:installationId
async function getInstallationById(req, res) {
  try {
    const { installationId } = req.params;

    if (!installationId) {
      return res.status(400).json({ error: 'installationId parameter is required' });
    }

    const installation = await SolarInstallation.findById(installationId);
    if (!installation) {
      return res.status(404).json({ error: `Installation ${installationId} not found` });
    }

    return res.status(200).json({ data: installation });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve installation', details: err.message });
  }
}

// GET /api/installations/:installationId/readings  (nested/scoped resource)
async function listInstallationReadings(req, res) {
  try {
    const { installationId } = req.params;

    if (!installationId) {
      return res.status(400).json({ error: 'installationId parameter is required' });
    }

    const installation = await SolarInstallation.findById(installationId);
    if (!installation) {
      return res.status(404).json({ error: `Installation ${installationId} not found` });
    }

    const readings = await GenerationReading.findByInstallation(installationId);
    return res.status(200).json({ count: readings.length, data: readings });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve readings for installation', details: err.message });
  }
}

// POST /api/installations/:installationId/readings  (nested/scoped resource)
async function createInstallationReading(req, res) {
  try {
    const { installationId } = req.params;

    // 1. Validate the route parameter.
    if (!installationId) {
      return res.status(400).json({ error: 'installationId parameter is required' });
    }

    // 2. Validate the request body exists and is a JSON object.
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ error: 'Request body must be a JSON object' });
    }

    // 3. Validate that all required reading fields are present.
    const missingFields = REQUIRED_READING_FIELDS.filter(
      (field) => body[field] === undefined || body[field] === null || body[field] === ''
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required reading fields',
        missingFields,
      });
    }

    // 4. Confirm the parent installation exists before creating the reading.
    const installation = await SolarInstallation.findById(installationId);
    if (!installation) {
      return res.status(404).json({ error: `Installation ${installationId} not found` });
    }

    // 5. Build the reading. installationId comes from the URL (not the body) so
    //    a client cannot attach a reading to a different installation.
    const readingData = {
      id: body.id,
      installationId,
      timestamp: body.timestamp,
      powerKw: body.powerKw,
      cumulativeEnergyKwh: body.cumulativeEnergyKwh,
      voltage: body.voltage,
    };

    // 6. Append-only insert (never updates or replaces an existing reading).
    const reading = await GenerationReading.createReading(readingData);

    // 7. 201 Created + Location header pointing at the new resource.
    return res
      .status(201)
      .location(`/api/installations/${installationId}/readings/${reading.id}`)
      .json({ data: reading });
  } catch (err) {
    // A duplicate business `id` violates the unique index -> 400 (client error).
    if (err && err.code === 11000) {
      return res.status(400).json({ error: 'A reading with this id already exists' });
    }
    return res.status(500).json({ error: 'Failed to create reading for installation', details: err.message });
  }
}

module.exports = {
  listInstallations,
  createInstallation,
  getInstallationById,
  listInstallationReadings,
  createInstallationReading,
};

