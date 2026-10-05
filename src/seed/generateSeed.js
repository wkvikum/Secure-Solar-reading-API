/**
 * generateSeed.js
 *
 * Generates realistic seed data for the Real-Time Solar Generation Data API.
 *
 * Entities & relationships:
 *   Province  -> has many Districts
 *   District  -> has many Grid Substations
 *   Substation -> has many Solar Installations
 *   Installation -> has many Generation Readings (append-only time-series)
 *
 * Notes:
 *   - meter_id / inverter_id are attributes of SolarInstallation (no separate Device entity).
 *   - Generation readings are stored in a separate `readings` collection, not inline.
 *
 * Run from the project root:
 *   node src/seed/generateSeed.js
 */

const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, 'seed.json');
const READING_INTERVAL_MINUTES = 15;
const DAYS_OF_READINGS = 7; // at least 7 days per installation
const READINGS_PER_DAY = (24 * 60) / READING_INTERVAL_MINUTES; // 96
const READING_DAYS = DAYS_OF_READINGS;
const TOTAL_READINGS_PER_INSTALLATION = READINGS_PER_DAY * READING_DAYS; // 672

// Readings start at 00:00 on this day (UTC) and run forward.
const READING_START = new Date('2026-01-01T00:00:00.000Z');

// ---------------------------------------------------------------------------
// Static, realistic Sri Lankan geographic data
// ---------------------------------------------------------------------------

const PROVINCES = [
  { id: 'PROV-01', name: 'Western', capital: 'Colombo' },
  { id: 'PROV-02', name: 'Central', capital: 'Kandy' },
  { id: 'PROV-03', name: 'Southern', capital: 'Galle' },
  { id: 'PROV-04', name: 'Northern', capital: 'Jaffna' },
  { id: 'PROV-05', name: 'Eastern', capital: 'Trincomalee' },
  { id: 'PROV-06', name: 'North Western', capital: 'Kurunegala' },
  { id: 'PROV-07', name: 'North Central', capital: 'Anuradhapura' },
  { id: 'PROV-08', name: 'Uva', capital: 'Badulla' },
  { id: 'PROV-09', name: 'Sabaragamuwa', capital: 'Ratnapura' },
];

// 25 districts, each assigned to a valid province.
const DISTRICTS = [
  { id: 'DIST-01', name: 'Colombo', provinceId: 'PROV-01' },
  { id: 'DIST-02', name: 'Gampaha', provinceId: 'PROV-01' },
  { id: 'DIST-03', name: 'Kalutara', provinceId: 'PROV-01' },
  { id: 'DIST-04', name: 'Kandy', provinceId: 'PROV-02' },
  { id: 'DIST-05', name: 'Matale', provinceId: 'PROV-02' },
  { id: 'DIST-06', name: 'Nuwara Eliya', provinceId: 'PROV-02' },
  { id: 'DIST-07', name: 'Galle', provinceId: 'PROV-03' },
  { id: 'DIST-08', name: 'Matara', provinceId: 'PROV-03' },
  { id: 'DIST-09', name: 'Hambantota', provinceId: 'PROV-03' },
  { id: 'DIST-10', name: 'Jaffna', provinceId: 'PROV-04' },
  { id: 'DIST-11', name: 'Kilinochchi', provinceId: 'PROV-04' },
  { id: 'DIST-12', name: 'Mannar', provinceId: 'PROV-04' },
  { id: 'DIST-13', name: 'Vavuniya', provinceId: 'PROV-04' },
  { id: 'DIST-14', name: 'Mullaitivu', provinceId: 'PROV-04' },
  { id: 'DIST-15', name: 'Batticaloa', provinceId: 'PROV-05' },
  { id: 'DIST-16', name: 'Ampara', provinceId: 'PROV-05' },
  { id: 'DIST-17', name: 'Trincomalee', provinceId: 'PROV-05' },
  { id: 'DIST-18', name: 'Kurunegala', provinceId: 'PROV-06' },
  { id: 'DIST-19', name: 'Puttalam', provinceId: 'PROV-06' },
  { id: 'DIST-20', name: 'Anuradhapura', provinceId: 'PROV-07' },
  { id: 'DIST-21', name: 'Polonnaruwa', provinceId: 'PROV-07' },
  { id: 'DIST-22', name: 'Badulla', provinceId: 'PROV-08' },
  { id: 'DIST-23', name: 'Monaragala', provinceId: 'PROV-08' },
  { id: 'DIST-24', name: 'Ratnapura', provinceId: 'PROV-09' },
  { id: 'DIST-25', name: 'Kegalle', provinceId: 'PROV-09' },
];

// 20 substations spread across districts.
const SUBSTATIONS = [
  { id: 'SUB-01', name: 'Colombo City Grid Substation', districtId: 'DIST-01', capacityMva: 150, voltageKv: 132 },
  { id: 'SUB-02', name: 'Biyagama Grid Substation', districtId: 'DIST-02', capacityMva: 100, voltageKv: 132 },
  { id: 'SUB-03', name: 'Kalutara Grid Substation', districtId: 'DIST-03', capacityMva: 63, voltageKv: 132 },
  { id: 'SUB-04', name: 'Kandy Grid Substation', districtId: 'DIST-04', capacityMva: 100, voltageKv: 132 },
  { id: 'SUB-05', name: 'Matale Grid Substation', districtId: 'DIST-05', capacityMva: 40, voltageKv: 66 },
  { id: 'SUB-06', name: 'Nuwara Eliya Grid Substation', districtId: 'DIST-06', capacityMva: 40, voltageKv: 66 },
  { id: 'SUB-07', name: 'Galle Grid Substation', districtId: 'DIST-07', capacityMva: 63, voltageKv: 132 },
  { id: 'SUB-08', name: 'Matara Grid Substation', districtId: 'DIST-08', capacityMva: 40, voltageKv: 66 },
  { id: 'SUB-09', name: 'Hambantota Grid Substation', districtId: 'DIST-09', capacityMva: 63, voltageKv: 132 },
  { id: 'SUB-10', name: 'Jaffna Grid Substation', districtId: 'DIST-10', capacityMva: 40, voltageKv: 132 },
  { id: 'SUB-11', name: 'Vavuniya Grid Substation', districtId: 'DIST-13', capacityMva: 40, voltageKv: 132 },
  { id: 'SUB-12', name: 'Batticaloa Grid Substation', districtId: 'DIST-15', capacityMva: 63, voltageKv: 132 },
  { id: 'SUB-13', name: 'Ampara Grid Substation', districtId: 'DIST-16', capacityMva: 40, voltageKv: 132 },
  { id: 'SUB-14', name: 'Trincomalee Grid Substation', districtId: 'DIST-17', capacityMva: 40, voltageKv: 66 },
  { id: 'SUB-15', name: 'Kurunegala Grid Substation', districtId: 'DIST-18', capacityMva: 100, voltageKv: 132 },
  { id: 'SUB-16', name: 'Puttalam Grid Substation', districtId: 'DIST-19', capacityMva: 63, voltageKv: 132 },
  { id: 'SUB-17', name: 'Anuradhapura Grid Substation', districtId: 'DIST-20', capacityMva: 63, voltageKv: 132 },
  { id: 'SUB-18', name: 'Polonnaruwa Grid Substation', districtId: 'DIST-21', capacityMva: 40, voltageKv: 66 },
  { id: 'SUB-19', name: 'Badulla Grid Substation', districtId: 'DIST-22', capacityMva: 40, voltageKv: 66 },
  { id: 'SUB-20', name: 'Ratnapura Grid Substation', districtId: 'DIST-24', capacityMva: 63, voltageKv: 66 },
  { id: 'SUB-21', name: 'Monaragala Grid Substation', districtId: 'DIST-23', capacityMva: 40, voltageKv: 66 },
  { id: 'SUB-22', name: 'Kegalle Grid Substation', districtId: 'DIST-25', capacityMva: 40, voltageKv: 66 },
];

const INSTALLATION_TYPES = ['Ground Mounted', 'Rooftop'];
const PANEL_BRANDS = ['Trina Solar', 'JinkoSolar', 'Longi', 'Canadian Solar', 'JA Solar'];

const USERS = [
  {
    id: 'USER-01',
    username: 'admin',
    fullName: 'System Administrator',
    email: 'admin@solargrid.lk',
    role: 'admin',
    passwordHash: '$2a$10$seedhash.admin.example.bcrypt.placeholder.000001',
  },
  {
    id: 'USER-02',
    username: 'nimal.perera',
    fullName: 'Nimal Perera',
    email: 'nimal.perera@ceylonenergy.lk',
    role: 'operator',
    passwordHash: '$2a$10$seedhash.operator.example.bcrypt.placeholder.0002',
    assignedSubstationIds: ['SUB-01', 'SUB-02'],
  },
  {
    id: 'USER-03',
    username: 'kavindi.j',
    fullName: 'Kavindi Jayasuriya',
    email: 'kavindi.j@ceylonenergy.lk',
    role: 'analyst',
    passwordHash: '$2a$10$seedhash.analyst.example.bcrypt.placeholder.003',
    assignedSubstationIds: ['SUB-04', 'SUB-07'],
  },
  {
    id: 'USER-04',
    username: 'm.rehman',
    fullName: 'Mohamed Rehman',
    email: 'm.rehman@solarlanka.lk',
    role: 'viewer',
    passwordHash: '$2a$10$seedhash.viewer.example.bcrypt.placeholder.00004',
  },
];

// ---------------------------------------------------------------------------
// Deterministic pseudo-random generator (seeded) so runs are reproducible.
// ---------------------------------------------------------------------------

function createRng(seed) {
  let state = seed >>> 0;
  return function rng() {
    // xorshift32
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0xffffffff;
  };
}

function randRange(rng, min, max) {
  return min + rng() * (max - min);
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function round(value, decimals) {
  const f = Math.pow(10, decimals);
  return Math.round(value * f) / f;
}

function pad(num, width) {
  return String(num).padStart(width, '0');
}

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

function buildInstallations(rng) {
  const installations = [];
  // Distribute roughly 10 installations per substation -> 220+ total.
  let counter = 1;
  SUBSTATIONS.forEach((sub) => {
    const count = 9 + Math.floor(rng() * 4); // 9..12 per substation
    for (let i = 0; i < count; i += 1) {
      const id = `INST-${pad(counter, 4)}`;
      const capacityKw = round(randRange(rng, 5, 500), 1); // realistic range
      installations.push({
        id,
        name: `${sub.name.replace(' Grid Substation', '')} Solar Plant ${pad(i + 1, 2)}`,
        substationId: sub.id,
        meterId: `MTR-${pad(counter, 6)}`,
        inverterId: `INV-${pad(counter, 6)}`,
        type: pick(rng, INSTALLATION_TYPES),
        panelBrand: pick(rng, PANEL_BRANDS),
        capacityKw,
        commissionDate: new Date(
          Date.UTC(2018 + Math.floor(rng() * 6), Math.floor(rng() * 12), 1 + Math.floor(rng() * 27))
        )
          .toISOString()
          .slice(0, 10),
        status: rng() > 0.1 ? 'active' : 'maintenance',
      });
      counter += 1;
    }
  });
  return installations;
}

/**
 * Solar generation solar-curve model.
 * Returns a normalised factor in [0, 1] for the given hour of day (fractional).
 * - Zero at night (before ~06:00 and after ~18:30).
 * - Rises after sunrise, peaks around midday, falls toward evening.
 */
function solarFactor(hourOfDayFloat) {
  const sunrise = 6.0;
  const sunset = 18.5;
  if (hourOfDayFloat <= sunrise || hourOfDayFloat >= sunset) {
    return 0;
  }
  // Map active window to [0, PI]; sine curve peaks at local midday.
  const t = (hourOfDayFloat - sunrise) / (sunset - sunrise); // 0..1
  const curve = Math.sin(Math.PI * t);
  return Math.max(0, curve);
}

function buildReadings(rng, installations) {
  const readings = [];
  let counter = 1;

  installations.forEach((inst) => {
    const capacityKw = inst.capacityKw;
    // Slight per-installation efficiency factor (0.85..1.0) for variety.
    const efficiency = randRange(rng, 0.85, 1.0);
    // Each installation's daily cumulative energy starts near 0.
    let cumulativeEnergyKwh = 0;

    for (let step = 0; step < TOTAL_READINGS_PER_INSTALLATION; step += 1) {
      const timestamp = new Date(READING_START.getTime() + step * READING_INTERVAL_MINUTES * 60 * 1000);
      const hourOfDay = timestamp.getUTCHours() + timestamp.getUTCMinutes() / 60;

      const factor = solarFactor(hourOfDay);
      // Small random cloud/irradiance variation per reading.
      const variation = factor > 0 ? randRange(rng, 0.8, 1.05) : 0;
      let powerKw = capacityKw * factor * efficiency * variation;
      if (powerKw < 0) powerKw = 0;
      powerKw = round(powerKw, 3);

      // Energy added over this 15-minute interval (kWh).
      const intervalHours = READING_INTERVAL_MINUTES / 60;
      cumulativeEnergyKwh += powerKw * intervalHours;
      cumulativeEnergyKwh = round(cumulativeEnergyKwh, 4);

      // Voltage: nominal AC voltage near 400V with small fluctuation; ~0 at night.
      let voltage = powerKw > 0.001 ? round(randRange(rng, 392, 408), 2) : 0;

      readings.push({
        id: `READ-${pad(counter, 8)}`,
        installationId: inst.id,
        timestamp: timestamp.toISOString(),
        powerKw,
        cumulativeEnergyKwh,
        voltage,
      });
      counter += 1;
    }
  });

  return readings;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(seed) {
  const errors = [];
  const { provinces, districts, substations, installations, readings, users } = seed;

  const provinceIds = new Set(provinces.map((p) => p.id));
  const districtIds = new Set(districts.map((d) => d.id));
  const substationIds = new Set(substations.map((s) => s.id));
  const installationIds = new Set(installations.map((i) => i.id));

  if (provinces.length !== 9) errors.push(`Expected exactly 9 provinces, found ${provinces.length}.`);
  if (districts.length !== 25) errors.push(`Expected exactly 25 districts, found ${districts.length}.`);
  if (substations.length < 20) errors.push(`Expected at least 20 substations, found ${substations.length}.`);
  if (installations.length < 200) errors.push(`Expected at least 200 installations, found ${installations.length}.`);

  // Foreign key checks.
  districts.forEach((d) => {
    if (!provinceIds.has(d.provinceId)) errors.push(`District ${d.id} references invalid province ${d.provinceId}.`);
  });
  substations.forEach((s) => {
    if (!districtIds.has(s.districtId)) errors.push(`Substation ${s.id} references invalid district ${s.districtId}.`);
  });
  installations.forEach((i) => {
    if (!substationIds.has(i.substationId)) {
      errors.push(`Installation ${i.id} references invalid substation ${i.substationId}.`);
    }
  });

  // Group readings per installation for ordering / cumulative / count checks.
  const byInstallation = new Map();
  readings.forEach((r) => {
    if (!installationIds.has(r.installationId)) {
      errors.push(`Reading ${r.id} references invalid installation ${r.installationId}.`);
      return;
    }
    if (!byInstallation.has(r.installationId)) byInstallation.set(r.installationId, []);
    byInstallation.get(r.installationId).push(r);
  });

  const minReadings = READINGS_PER_DAY * 7;
  installations.forEach((inst) => {
    const list = byInstallation.get(inst.id) || [];
    if (list.length < minReadings) {
      errors.push(`Installation ${inst.id} has ${list.length} readings (< ${minReadings}).`);
      return;
    }
    for (let i = 1; i < list.length; i += 1) {
      const prev = list[i - 1];
      const curr = list[i];
      if (new Date(curr.timestamp).getTime() <= new Date(prev.timestamp).getTime()) {
        errors.push(`Installation ${inst.id} readings not strictly ordered at index ${i}.`);
        break;
      }
      if (curr.cumulativeEnergyKwh < prev.cumulativeEnergyKwh) {
        errors.push(`Installation ${inst.id} cumulativeEnergyKwh decreased at index ${i}.`);
        break;
      }
    }
  });

  return errors;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const rng = createRng(20260101);

  const installations = buildInstallations(rng);
  const readings = buildReadings(rng, installations);

  const seed = {
    provinces: PROVINCES,
    districts: DISTRICTS,
    substations: SUBSTATIONS,
    installations,
    readings,
    users: USERS,
  };

  fs.writeFileSync(SEED_PATH, `${JSON.stringify(seed, null, 2)}\n`, 'utf8');

  const errors = validate(seed);

  // Summary
  console.log('Seed data generated:', SEED_PATH);
  console.log('----------------------------------------');
  console.log(`Provinces   : ${seed.provinces.length}`);
  console.log(`Districts   : ${seed.districts.length}`);
  console.log(`Substations : ${seed.substations.length}`);
  console.log(`Installations: ${seed.installations.length}`);
  console.log(`Readings    : ${seed.readings.length}`);
  console.log(`Users       : ${seed.users.length}`);
  console.log('----------------------------------------');

  if (errors.length > 0) {
    console.error(`Validation FAILED with ${errors.length} error(s):`);
    errors.slice(0, 20).forEach((e) => console.error(` - ${e}`));
    if (errors.length > 20) console.error(` ...and ${errors.length - 20} more.`);
    process.exit(1);
  }

  console.log('Validation PASSED: all references valid, counts meet requirements.');
}

main();
