/**
 * readingController.js
 *
 * Request handling for the GenerationReading resource.
 *
 * Routes (mounted under /api/readings):
 *   GET  /api/readings                -> listReadings (collection)
 *   GET  /api/readings/:readingId     -> getReadingById (individual)
 *
 * Optionally, listReadings supports ?installationId=... to scope the collection
 * to a single installation (append-only time-series).
 */

const GenerationReading = require('../models/GenerationReading');
const SolarInstallation = require('../models/SolarInstallaion');

// Pagination defaults and bounds for the collection GET endpoint.
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse and validate the `page` and `limit` query parameters.
 *
 * Returns `{ value }` on success or `{ error }` (a human-readable message) when
 * a parameter is not a positive integer.
 */
function parsePagination(query) {
  const rawPage = query.page;
  const rawLimit = query.limit;

  let page = DEFAULT_PAGE;
  if (rawPage !== undefined) {
    page = Number(rawPage);
    if (!Number.isInteger(page) || page < 1) {
      return { error: '"page" must be a positive integer' };
    }
  }

  let limit = DEFAULT_LIMIT;
  if (rawLimit !== undefined) {
    limit = Number(rawLimit);
    if (!Number.isInteger(limit) || limit < 1) {
      return { error: '"limit" must be a positive integer' };
    }
    // Cap the page size to a reasonable maximum.
    if (limit > MAX_LIMIT) {
      limit = MAX_LIMIT;
    }
  }

  return { value: { page, limit } };
}

// GET /api/readings
async function listReadings(req, res) {
  try {
    const { installationId } = req.query;

    // Optional scoping: filter readings by installation query parameter.
    if (installationId) {
      const installation = await SolarInstallation.findById(installationId);
      if (!installation) {
        return res.status(404).json({ error: `Installation ${installationId} not found` });
      }
      const readings = await GenerationReading.findByInstallation(installationId);
      return res.status(200).json({ count: readings.length, data: readings });
    }

    // Validate pagination query parameters.
    const parsed = parsePagination(req.query);
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }
    const { page, limit } = parsed.value;

    // Efficient paginated read: countDocuments + skip/limit window.
    const { readings, totalCount } = await GenerationReading.findAllPaginated({ page, limit });

    const totalPages = Math.ceil(totalCount / limit) || 0;
    const nextPage = page < totalPages ? page + 1 : null;
    const previousPage = page > 1 ? page - 1 : null;

    return res.status(200).json({
      count: readings.length,
      data: readings,
      totalCount,
      totalPages,
      currentPage: page,
      nextPage,
      previousPage,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve readings', details: err.message });
  }
}

// GET /api/readings/:readingId
async function getReadingById(req, res) {
  try {
    const { readingId } = req.params;

    if (!readingId) {
      return res.status(400).json({ error: 'readingId parameter is required' });
    }

    const reading = await GenerationReading.findById(readingId);
    if (!reading) {
      return res.status(404).json({ error: `Reading ${readingId} not found` });
    }

    return res.status(200).json({ data: reading });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve reading', details: err.message });
  }
}

module.exports = {
  listReadings,
  getReadingById,
};
