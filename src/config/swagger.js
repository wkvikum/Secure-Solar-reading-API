/**
 * swagger.js
 *
 * OpenAPI 3.0 (Swagger) configuration for the Solar Generation Data API.
 *
 * Responsibilities:
 *   - Build a single OpenAPI document from JSDoc annotations placed in the
 *     existing route files (see `apis` glob below).
 *   - Define the reusable component schemas that mirror the real Mongoose
 *     models (Province, District, GridSubstation, SolarInstallation,
 *     GenerationReading, User) plus a shared ErrorResponse.
 *   - Declare the HTTP bearer (JWT) security scheme and the intended
 *     authorization scopes.
 *
 * Design notes:
 *   - This module ONLY describes the API. It does not import, modify or execute
 *     any route, controller or model logic.
 *   - The documented schemas reflect the actual persisted fields produced by the
 *     models (`mongooseOptions.js` strips Mongo `_id` / `__v` from responses,
 *     so those keys are intentionally not documented).
 *   - The base server URL is read from the SWAGGER_SERVER_URL / BASE_URL
 *     environment variables when present (for the deployed API) and otherwise
 *     falls back to http://localhost:<PORT> so local development keeps working.
 */

const swaggerJsdoc = require('swagger-jsdoc');

// Port used by the app entry point (index.js); kept in sync via process.env.
const port = process.env.PORT || 3000;

// Base URL for the "servers" list. In production set SWAGGER_SERVER_URL (or the
// generic BASE_URL) in the environment, e.g. https://api.example.com. Falls
// back to localhost so local development and Swagger UI keep working.
const serverUrl =
  process.env.SWAGGER_SERVER_URL ||
  process.env.BASE_URL ||
  `http://localhost:${port}`;

/**
 * Static OpenAPI building blocks: info, servers, tags, security and the
 * reusable component schemas/parameters/responses. Endpoint paths are supplied
 * separately via the JSDoc annotations in src/routes/*.js.
 */
const openapiDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Real-Time Solar Generation Data API',
    version: '1.0.0',
    description:
      'REST API for the Sri Lanka Sustainable Energy Authority (SLSEA) to ' +
      'collect, manage and serve real-time and historical solar power ' +
      'generation data across a geographic hierarchy:\n\n' +
      'Province -> District -> Grid Substation -> Solar Installation -> Generation Readings\n\n' +
      'The API follows RESTful design (Richardson Maturity Model Level 2). ' +
      'All resource endpoints are namespaced under `/api`.',
    contact: {
      name: 'SLSEA Solar API',
    },
    license: {
      name: 'ISC',
    },
  },
  servers: [
    {
      url: serverUrl,
      description:
        serverUrl.includes('localhost')
          ? 'Local development server'
          : 'Configured / deployed server',
    },
  ],
  tags: [
    { name: 'Provinces', description: 'Top-level geographical jurisdictions' },
    { name: 'Districts', description: 'Districts belonging to a province' },
    { name: 'Substations', description: 'Grid substations connected to installations' },
    { name: 'Installations', description: 'Rooftop solar generation sites' },
    { name: 'Readings', description: 'Append-only solar generation time series' },
    { name: 'Users', description: 'SLSEA users with a role and jurisdiction scope' },
    { name: 'System', description: 'Service health and status' },
  ],
  // Global default: endpoints are currently PUBLIC because the API does not yet
  // enforce authentication. Individual write endpoints opt into `bearerAuth` to
  // document the INTENDED protection (see each operation's `security` block).
  security: [],
  components: {
    securitySchemes: {
      // HTTP bearer JWT. NOTE: authentication is NOT yet enforced by the API
      // (there is no auth middleware in the codebase). This scheme documents the
      // intended security model so endpoints can be protected once the auth
      // layer is implemented.
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'JWT Bearer token. Intended for the security model described in the ' +
          'README (metering-device write access and jurisdiction-scoped read ' +
          'access). Not yet enforced by the API.',
      },
    },
    parameters: {
      provinceId: {
        name: 'provinceId',
        in: 'path',
        required: true,
        description: 'Business identifier of the province (e.g. "PROV-01").',
        schema: { type: 'string', example: 'PROV-01' },
      },
      districtId: {
        name: 'districtId',
        in: 'path',
        required: true,
        description: 'Business identifier of the district (e.g. "DIST-01").',
        schema: { type: 'string', example: 'DIST-01' },
      },
      substationId: {
        name: 'substationId',
        in: 'path',
        required: true,
        description: 'Business identifier of the grid substation (e.g. "SUB-01").',
        schema: { type: 'string', example: 'SUB-01' },
      },
      installationId: {
        name: 'installationId',
        in: 'path',
        required: true,
        description: 'Business identifier of the solar installation (e.g. "INST-0001").',
        schema: { type: 'string', example: 'INST-0001' },
      },
      readingId: {
        name: 'readingId',
        in: 'path',
        required: true,
        description: 'Business identifier of the generation reading (e.g. "READ-00000001").',
        schema: { type: 'string', example: 'READ-00000001' },
      },
      userId: {
        name: 'userId',
        in: 'path',
        required: true,
        description: 'Business identifier of the user (e.g. "USER-01").',
        schema: { type: 'string', example: 'USER-01' },
      },
      page: {
        name: 'page',
        in: 'query',
        required: false,
        description: '1-based page number. Defaults to 1.',
        schema: { type: 'integer', minimum: 1, default: 1, example: 1 },
      },
      limit: {
        name: 'limit',
        in: 'query',
        required: false,
        description: 'Page size. Defaults to 20; capped at 100.',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20, example: 20 },
      },
      provinceIdQuery: {
        name: 'provinceId',
        in: 'query',
        required: false,
        description: 'Filter by province business id.',
        schema: { type: 'string', example: 'PROV-01' },
      },
      districtIdQuery: {
        name: 'districtId',
        in: 'query',
        required: false,
        description: 'Filter by district business id.',
        schema: { type: 'string', example: 'DIST-01' },
      },
      substationIdQuery: {
        name: 'substationId',
        in: 'query',
        required: false,
        description: 'Filter by grid substation business id.',
        schema: { type: 'string', example: 'SUB-01' },
      },
      installationIdQuery: {
        name: 'installationId',
        in: 'query',
        required: false,
        description: 'Scope the readings collection to a single installation.',
        schema: { type: 'string', example: 'INST-0001' },
      },
    },
    responses: {
      BadRequest: {
        description: 'Invalid request (validation failed or malformed body).',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      Unauthorized: {
        description: 'Authentication required (reserved for the intended JWT model).',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      Forbidden: {
        description: 'Authenticated but lacking the required scope (reserved for the intended JWT model).',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      NotFound: {
        description: 'The requested resource does not exist.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      Conflict: {
        description: 'The resource already exists (duplicate identifier).',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      ServerError: {
        description: 'Unexpected server error.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
    schemas: {
      // -----------------------------------------------------------------
      // Domain resources (fields mirror the real Mongoose models)
      // -----------------------------------------------------------------
      Province: {
        type: 'object',
        description: 'Top-level geographical jurisdiction.',
        properties: {
          id: { type: 'string', example: 'PROV-01' },
          name: { type: 'string', example: 'Western' },
          capital: { type: 'string', example: 'Colombo' },
        },
        required: ['id', 'name', 'capital'],
      },
      District: {
        type: 'object',
        description: 'District belonging to a province.',
        properties: {
          id: { type: 'string', example: 'DIST-01' },
          name: { type: 'string', example: 'Colombo' },
          provinceId: { type: 'string', example: 'PROV-01', description: 'FK -> Province.id' },
        },
        required: ['id', 'name', 'provinceId'],
      },
      GridSubstation: {
        type: 'object',
        description: 'Grid substation belonging to a district.',
        properties: {
          id: { type: 'string', example: 'SUB-01' },
          name: { type: 'string', example: 'Colombo City Grid Substation' },
          districtId: { type: 'string', example: 'DIST-01', description: 'FK -> District.id' },
          capacityMva: { type: 'number', example: 150 },
          voltageKv: { type: 'number', example: 132 },
        },
        required: ['id', 'name', 'districtId'],
      },
      SolarInstallation: {
        type: 'object',
        description:
          'Rooftop solar generation site. The meter and inverter identifiers are ' +
          'attributes of the installation itself (there is no separate Device entity).',
        properties: {
          id: { type: 'string', example: 'INST-0001' },
          name: { type: 'string', example: 'Colombo City Solar Plant 01' },
          substationId: { type: 'string', example: 'SUB-01', description: 'FK -> GridSubstation.id' },
          meterId: { type: 'string', example: 'MTR-000001' },
          inverterId: { type: 'string', example: 'INV-000001' },
          type: { type: 'string', example: 'Rooftop' },
          panelBrand: { type: 'string', example: 'JinkoSolar' },
          capacityKw: { type: 'number', example: 344.8 },
          commissionDate: { type: 'string', example: '2022-04-03' },
          status: { type: 'string', example: 'active' },
        },
        required: ['id', 'name', 'substationId'],
      },
      GenerationReading: {
        type: 'object',
        description:
          'Append-only, timestamped solar generation record (independent ' +
          'time-series entity; never embedded in the installation).',
        properties: {
          id: { type: 'string', example: 'READ-00000001' },
          installationId: { type: 'string', example: 'INST-0001', description: 'FK -> SolarInstallation.id' },
          timestamp: {
            type: 'string',
            description: 'ISO-8601 timestamp (stored as a string; 15-minute interval).',
            example: '2026-01-01T07:00:00.000Z',
          },
          powerKw: { type: 'number', example: 66.304, description: 'Instantaneous power (kW).' },
          cumulativeEnergyKwh: { type: 'number', example: 45.7419, description: 'Cumulative energy (kWh).' },
          voltage: { type: 'number', example: 394.95, description: 'Voltage (V).' },
        },
        required: ['id', 'installationId', 'timestamp'],
      },
      User: {
        type: 'object',
        description:
          'SLSEA user with a role and a jurisdiction scope (`roleId`). Kept free ' +
          'of auth logic; `passwordHash` is stored but never validated here.',
        properties: {
          id: { type: 'string', example: 'USER-01' },
          name: { type: 'string', example: 'admin' },
          email: { type: 'string', format: 'email', example: 'admin@solargrid.lk' },
          role: { type: 'string', example: 'admin' },
          roleId: { type: 'string', example: 'national', description: 'Access scope, e.g. "national" or "PROV-01".' },
          active: { type: 'boolean', example: true },
          passwordHash: { type: 'string', example: '$2a$10$...', description: 'Stored credential hash.' },
          assignedSubstationIds: {
            type: 'array',
            items: { type: 'string' },
            example: ['SUB-01', 'SUB-02'],
            description: 'Optional substation scoping for the user.',
          },
        },
        required: ['id', 'name', 'role', 'roleId'],
      },
      // -----------------------------------------------------------------
      // Shared response envelopes (mirror the actual controller output)
      // -----------------------------------------------------------------
      ErrorResponse: {
        type: 'object',
        description:
          'Consistent error envelope returned by the controllers. The shape is ' +
          '`{ error, details? }` (plus `missingFields` / `duplicateFields` on ' +
          'specific validation errors).',
        properties: {
          error: { type: 'string', example: 'Installation INST-9999 not found' },
          details: { type: 'string', example: 'No installation exists with ID INST-9999.' },
          missingFields: {
            type: 'array',
            items: { type: 'string' },
            example: ['timestamp', 'powerKw'],
          },
          duplicateFields: {
            type: 'array',
            items: { type: 'string' },
            example: ['meterId'],
          },
        },
        required: ['error'],
      },
      CountedList: {
        type: 'object',
        description: 'Standard list response: a count plus the array of resources.',
        properties: {
          count: { type: 'integer', example: 9 },
          data: { type: 'array', items: {} },
        },
        required: ['count', 'data'],
      },
      PaginatedReadings: {
        type: 'object',
        description:
          'Paginated readings response for GET /api/readings (global collection).',
        properties: {
          count: { type: 'integer', example: 20, description: 'Number of items in this page.' },
          data: { type: 'array', items: { $ref: '#/components/schemas/GenerationReading' } },
          totalCount: { type: 'integer', example: 1200000 },
          totalPages: { type: 'integer', example: 60000 },
          currentPage: { type: 'integer', example: 1 },
          nextPage: { type: 'integer', nullable: true, example: 2 },
          previousPage: { type: 'integer', nullable: true, example: null },
        },
        required: ['count', 'data', 'totalCount', 'totalPages', 'currentPage'],
      },
    },
  },
};

/**
 * Options passed to swagger-jsdoc.
 *
 * The `apis` glob points at the existing route files plus the app entry point
 * (index.js), where each endpoint is described with an `@openapi` JSDoc block.
 * swagger-jsdoc merges those paths with the static definition above.
 */
const swaggerOptions = {
  definition: openapiDefinition,
  apis: ['./src/routes/*.js', './index.js'],
};

// Build the final OpenAPI document once at module load.
const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
