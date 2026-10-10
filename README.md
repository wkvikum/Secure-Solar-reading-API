#This application is the real time monitoring soalr electricty generation data collecing API

# Real-Time Solar Generation Data API

REST API for the **Sri Lanka Sustainable Energy Authority (SLSEA)** to collect, manage, and provide real-time and historical solar power generation data from rooftop solar installations across Sri Lanka.

The API is designed according to REST API design principles and targets **Richardson Maturity Model Level 2**. It provides separate write access for solar metering devices and read access for authorised SLSEA users.

---

## 📌 Project Overview

The system provides an API for managing solar generation data across a geographic hierarchy:

```text
Province
   └── District
         └── Grid Substation
                └── Solar Installation
                       └── Generation Readings
```

The system supports two main types of clients:

- **Metering devices** – authenticate as an installation and submit generation readings.
- **SLSEA users** – retrieve solar generation information according to their jurisdiction.

Generation readings are stored as an **append-only time series**, allowing both real-time monitoring and historical analysis.

---

## 🎯 Main Objectives

- Manage Sri Lankan provinces and districts.
- Manage grid substations.
- Manage solar installations.
- Store historical solar generation readings.
- Provide the latest reading for an installation.
- Allow authorised devices to submit readings.
- Provide jurisdiction-scoped access for SLSEA users.
- Support pagination, filtering and sorting.
- Support conditional GET requests.
- Provide consistent API error responses.
- Provide OpenAPI/Swagger documentation.
- Deploy the API publicly over HTTPS.

---

## 🏗️ Domain Model

The main entities are:

| Entity | Description |
|---|---|
| Province | Top-level geographical jurisdiction |
| District | District belonging to a province |
| Grid Substation | Grid node connected to solar installations |
| Solar Installation | Rooftop solar generation site |
| Generation Reading | Timestamped generation record |
| User | SLSEA user with role and jurisdiction |

### Important modelling decisions

The meter/inverter identifier is stored as an attribute of the `SolarInstallation`. A separate `Device` entity is not required.

`GenerationReading` is maintained as an independent append-only time series rather than storing only the latest power value on the installation.

This preserves historical generation information required for analytical queries. These modelling decisions are explicitly required by the coursework specification and marking rubric.

---

## 🔐 Security Model

The API separates **write** and **read** responsibilities.

### Metering Device

A metering device:

- Authenticates as its solar installation.
- Can submit generation readings for that installation.
- Cannot submit readings for another installation.
- Cannot modify geographic or user data.

### SLSEA User

SLSEA users have read permissions according to their jurisdiction.

For example:

```text
National User
    ↓
All provinces

Province User
    ↓
Assigned province

District User
    ↓
Assigned district
```

JWT Bearer authentication and scopes are used to protect the API.

Example scopes:

```text
installation-write
analyst-read
analyst-read-by-province
analyst-read-by-district
```

The marking rubric identifies JWT authentication, installation-specific write access and jurisdiction-scoped read access as the higher-band security implementation.

---

## 🌐 API Resources

The API follows RESTful resource naming conventions using plural nouns and scoped collections.

### Provinces

```http
GET /provinces
GET /provinces/{provinceId}
```

### Districts

```http
GET /districts
GET /districts/{districtId}
```

Scoped example:

```http
GET /provinces/{provinceId}/districts
```

### Grid Substations

```http
GET /grid-substations
GET /grid-substations/{substationId}
```

### Solar Installations

```http
GET /solar-installations
GET /solar-installations/{installationId}
```

### Installation Composite Resource

```http
GET /solar-installations/{installationId}/details
```

Returns the installation together with relevant related information.

### Latest Generation Reading

```http
GET /solar-installations/{installationId}/last-reading
```

Returns the most recent generation reading for an installation.

### Generation History

```http
GET /solar-installations/{installationId}/readings
```

Example:

```http
GET /solar-installations/101/readings?page=1&limit=20
```

---

## ⚡ Generation Reading Ingestion

Authenticated installations can create new readings.

```http
POST /solar-installations/{installationId}/readings
```

Example request:

```json
{
  "timestamp": "2026-10-05T10:15:00Z",
  "powerKw": 4.82,
  "energyKwh": 1256.45,
  "voltage": 231.4
}
```

Successful creation returns:

```http
201 Created
```

with a `Location` header pointing to the newly created resource.

The coursework specifically requires correct creation semantics, including the appropriate HTTP method, `201 Created`, and a `Location` header.

---

## 🔎 Filtering

Generation history supports filtering by geographical scope and time period.

Example:

```http
GET /solar-installations/{installationId}/readings?from=2026-10-01&to=2026-10-05
```

Possible jurisdiction filters include:

```text
province
district
grid substation
```

---

## ↕️ Sorting

Readings can be sorted by timestamp.

Ascending:

```http
GET /solar-installations/{installationId}/readings?sort=timestamp:asc
```

Descending:

```http
GET /solar-installations/{installationId}/readings?sort=timestamp:desc
```

---

## 📄 Pagination

Historical readings support pagination.

Example:

```http
GET /solar-installations/101/readings?page=1&limit=20
```

Example response structure:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 168,
    "next": "/solar-installations/101/readings?page=2&limit=20",
    "previous": null
  }
}
```

Pagination is important because the seeded dataset contains at least one week of readings per installation.

---

## 🔄 Conditional GET

Retrievable resources support conditional requests using headers such as:

```http
ETag
Last-Modified
```

Example:

```http
If-None-Match: "abc123"
```

If the resource has not changed:

```http
304 Not Modified
```

with an empty response body.

Conditional GET is part of the required advanced API behaviour.

---

## ❌ Error Handling

The API uses a consistent error response format.

Example:

```json
{
  "code": "RESOURCE_NOT_FOUND",
  "message": "Solar installation was not found.",
  "detail": "No installation exists with ID 101."
}
```

Typical HTTP status codes include:

| Status | Meaning |
|---|---|
| `200 OK` | Successful request |
| `201 Created` | Resource successfully created |
| `400 Bad Request` | Invalid request |
| `401 Unauthorized` | Authentication required |
| `403 Forbidden` | Insufficient permission |
| `404 Not Found` | Resource does not exist |
| `406 Not Acceptable` | Unsupported representation |
| `412 Precondition Failed` | Conditional request failed |
| `304 Not Modified` | Resource has not changed |

The coursework marking rubric specifically evaluates correct REST status codes and headers.

---

## 🌱 Seed Data

The API is populated with realistic seed data.

Target dataset:

| Data | Approximate Amount |
|---|---:|
| Provinces | 9 |
| Districts | 25 |
| Grid Substations | 20+ |
| Solar Installations | 200+ |
| Generation Readings | 1+ week per installation |

Generation follows a realistic daily pattern where solar generation increases during daylight hours and decreases to zero during the night.

These scales are based on the coursework requirements.

---

## 📚 API Documentation

Interactive API documentation is available through Swagger/OpenAPI (OpenAPI 3.0):

**Swagger UI:** `http://localhost:3000/api-docs`
**OpenAPI JSON:** `http://localhost:3000/api-docs.json`

When deployed, replace `http://localhost:3000` with your deployed base URL (or set
the `SWAGGER_SERVER_URL` / `BASE_URL` environment variable so the spec lists the
deployed server automatically).

The coursework requires the Swagger/OpenAPI surface to be available from the deployed API.

---

## 🚀 Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_PROJECT_NAME
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Do not commit `.env` to GitHub.

Add it to `.gitignore`:

```text
node_modules/
.env
```

### 4. Seed the database

```bash
npm run seed
```

### 5. Start the development server

```bash
npm run dev
```

or:

```bash
npm start
```

The API will normally be available at:

```text
http://localhost:3000
```

---

## 🧪 Testing

The API can be tested using:

- Swagger UI
- Postman
- cURL
- Automated tests

Example:

```bash
curl http://localhost:3000/provinces
```

Example for installation readings:

```bash
curl http://localhost:3000/solar-installations/101/readings
```

---

## 🛠️ Technology Stack

- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **JWT**
- **OpenAPI / Swagger**
- **JavaScript**
- **Git / GitHub**

---

## 📁 Project Structure

```text
project/
│
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   ├── config/
│   └── app.js
│
├── seed/
│   └── seed.js
│
├── tests/
│
├── swagger/
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

The exact structure may be adjusted according to the final implementation.

---

## 🏛️ REST Design Principles

The API follows the following design principles:

- Resource-oriented URLs
- Plural collection names
- Noun-based resource names
- Scoped sub-collections
- Correct HTTP methods
- Correct HTTP status codes
- JSON representations
- Pagination
- Filtering
- Sorting
- Conditional requests
- Consistent error responses
- Authentication and authorization
- HTTPS deployment

The coursework's marking criteria place particular emphasis on resource taxonomy, URI naming, HTTP methods, status codes, headers and JSON representation.

---

## 📊 Richardson Maturity Model

This API targets:

### Level 2 – HTTP Verbs

The API uses:

- Resource-based URLs
- HTTP methods such as `GET` and `POST`
- HTTP status codes
- JSON representations

Level 3 hypermedia controls are outside the scope of this coursework.

---

## ☁️ Deployment

The API is deployed publicly using HTTPS.

**Production API:**

`YOUR_DEPLOYED_API_URL`

**Swagger Documentation:**

`YOUR_SWAGGER_URL`

The deployed API must be reachable externally and must not depend on localhost for assessment.

---

## 🔐 Security Considerations

Sensitive configuration values are stored using environment variables.

```text
.env
```

is excluded from version control.

Authentication is implemented for protected endpoints, while authorization ensures that users cannot access data outside their permitted jurisdiction.

HTTPS is used for production communication.

---

## 📈 Future Improvements

Possible future improvements include:

- District generation summary
- Real-time monitoring dashboards
- More granular attribute-based authorization
- Refresh-token support
- Rate limiting
- API monitoring and logging
- Automated CI/CD deployment
- More advanced analytics
- Solar generation forecasting

The district generation summary is identified as an upper-band stretch feature in the coursework specification.

---

## 👨‍💻 Author

**Name:** W K  
**Module:** Web API  
**Institution:** NIBM  
**Year:** 2026

---

## 📄 Coursework Context

This project was developed as part of the **Real-Time Solar Generation Data API** coursework for the Sri Lanka Sustainable Energy Authority domain.

The API implements the required architecture, REST design, seed data, advanced read behaviour, security, documentation and deployment requirements described in the coursework specification.

---

## ⚠️ Disclaimer

This project is an academic implementation created for coursework purposes. It is not an official SLSEA production system.