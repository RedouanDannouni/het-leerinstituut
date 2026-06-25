/**
 * Dummy-data voor alle 6 Kwaliteitsmonitor-vragenlijsten.
 * Eenmalig / herhaalbaar: node scripts/seed-forms-dummy.mjs
 *
 * Per school (excl. instituut):
 *   25 lesobservatie, 25 zelfevaluatie, 50 leerlingfeedback,
 *   10 plc schoolleiding, 25 plc docenten, 50 plc leerlingen
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    /* .env optioneel als vars al gezet zijn */
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY zijn verplicht.");
  process.exit(1);
}

const TARGETS = {
  lesobservatie_coaches: 25,
  zelfevaluatie: 25,
  leerlingfeedback: 50,
  plc_schoolleiding: 10,
  plc_docenten: 25,
  plc_leerlingen: 50,
};

const DOCENTEN = [
  "Eva Jansen",
  "Tom de Boer",
  "Fatima El Amrani",
  "Pieter Visser",
  "Lisa van den Berg",
  "Ahmed Hassan",
  "Sophie Mulder",
  "Daan Bakker",
  "Nadia Smit",
  "Jeroen Kuipers",
];

const OBSERVANTEN = ["Sanne de Vries", "Ilias El Amrani", "Nora Bakker", "Joost Pietersen"];
const KLASSEN = ["5A", "5B", "6A", "6B", "7A", "7B", "8A", "8B"];
const VAKKEN = ["Nederlands", "Rekenen", "Engels", "Wereldoriëntatie", "Kunst", "Gym"];
const OPLEIDINGEN = ["PABO", "Master Leraar PO", "Onderwijskunde", "Pedagogiek"];
const LEERJAREN = ["Groep 5", "Groep 6", "Groep 7", "Groep 8"];
const ONDERWIJS_TYPES = ["Basisonderwijs", "Speciaal basisonderwijs"];

function pick(list, i) {
  return list[i % list.length];
}

/**
 * Deterministische pseudo-random 1–4. `bias` verschuift de verdeling omhoog,
 * zodat verschillende respondentperspectieven herkenbaar verschillende gemiddelden
 * krijgen (coach lager, leraar midden, leerling hoger). Triangulatie wordt zo zichtbaar.
 */
function score(seed, bias = 0) {
  const n = (seed * 9301 + 49297) % 233280;
  const r = n / 233280 + bias;
  if (r < 0.22) return 1;
  if (r < 0.55) return 2;
  if (r < 0.86) return 3;
  return 4;
}

// Vaste perspectief-biassen: coach observeert strenger dan de leraar reflecteert,
// leerlingen ervaren het positiefst. (Coach ~2,6 · leraar ~3,1 · leerling ~3,5.)
const BIAS = {
  coach: 0.08,
  leraar: 0.25,
  leerling: 0.45,
  schoolleiding: 0.35,
  docenten: 0.12,
  plcLeerling: 0.3,
};

// Groei over de meetmomenten voor de coach-observatie.
const MEETMOMENT_BIAS = {
  Nulmeting: -0.12,
  Volgmeting: 0.0,
  Eindmeting: 0.15,
};

function bouwsteenColumns(seedBase, bias = 0) {
  const cols = {};
  const ranges = [
    ["b1", 1, 4],
    ["b2", 5, 9],
    ["b3", 10, 13],
    ["b4", 14, 18],
    ["b5", 19, 23],
    ["b6", 24, 28],
  ];
  let i = 0;
  for (const [prefix, from, to] of ranges) {
    for (let q = from; q <= to; q += 1) {
      cols[`${prefix}_q${q}`] = score(seedBase + i, bias);
      i += 1;
    }
  }
  return cols;
}

function plcColumns(prefix, count, seedBase, bias = 0) {
  const cols = {};
  for (let q = 1; q <= count; q += 1) {
    cols[`${prefix}_q${q}`] = score(seedBase + q, bias);
  }
  return cols;
}

function plcLeerlingColumns(seedBase, bias = 0) {
  const cols = {};
  for (let q = 1; q <= 11; q += 1) {
    cols[`q${q}`] = score(seedBase + q, bias);
  }
  return cols;
}

function dateOffset(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function timeSlot(i) {
  const hours = 8 + (i % 7);
  return `${String(hours).padStart(2, "0")}:${i % 2 === 0 ? "15" : "45"}:00`;
}

function buildLesobservatie(tenant, i) {
  const seed = i * 17 + tenant.id.length;
  const typeMeting = pick(["Nulmeting", "Volgmeting", "Eindmeting"], i);
  const bias = BIAS.coach + MEETMOMENT_BIAS[typeMeting];
  return {
    tenant_id: tenant.id,
    schoolnaam: tenant.name,
    email: `coach${(i % 4) + 1}@leerinstituut.test`,
    naam_observant: pick(OBSERVANTEN, i),
    type_meting: typeMeting,
    datum_observatie: dateOffset(i * 3),
    tijdstip_observatie: timeSlot(i),
    naam_leraar: pick(DOCENTEN, i),
    klas: pick(KLASSEN, i),
    vak: pick(VAKKEN, i),
    empirische_observatie: `Dummy observatie ${i + 1}: duidelijke instructie en actieve betrokkenheid.`,
    b1_analyse: "Sterkte: heldere structuur. Ontwikkeling: meer wachtijd.",
    b2_analyse: "Sterkte: leerdoelen zichtbaar. Ontwikkeling: succescriteria expliciteren.",
    b3_analyse: "Sterkte: activerende werkvormen. Ontwikkeling: zelfregulatie explicieter.",
    b4_analyse: "Sterkte: tijdige feedback. Ontwikkeling: peer feedback versterken.",
    b5_analyse: "Sterkte: warm leerklimaat. Ontwikkeling: consequent gedrag benoemen.",
    b6_analyse: "Sterkte: differentiatie aanwezig. Ontwikkeling: flexibele groepering.",
    ...bouwsteenColumns(seed, bias),
    created_by: null,
  };
}

function buildZelfevaluatie(tenant, i) {
  const seed = i * 23 + tenant.id.length;
  return {
    tenant_id: tenant.id,
    schoolnaam: tenant.name,
    datum_zelfevaluatie: dateOffset(i * 4),
    gender: pick(["Man", "Vrouw", "Anders / zeg ik liever niet"], i),
    leeftijd: 28 + (i % 20),
    hoogst_genoten_opleiding: pick(OPLEIDINGEN, i),
    lesgroep: pick(KLASSEN, i),
    ...bouwsteenColumns(seed, BIAS.leraar),
    created_by: null,
  };
}

function buildLeerlingfeedback(tenant, i) {
  const seed = i * 31 + tenant.id.length;
  return {
    tenant_id: tenant.id,
    schoolnaam: tenant.name,
    datum_leerlingfeedback: dateOffset(i * 2),
    gender: i % 2 === 0 ? "Jongen" : "Meisje",
    leeftijd: 9 + (i % 4),
    klas: pick(KLASSEN, i),
    ...bouwsteenColumns(seed, BIAS.leerling),
    created_by: null,
  };
}

function buildPlcSchoolleiding(tenant, i) {
  const seed = i * 41 + tenant.id.length;
  return {
    tenant_id: tenant.id,
    schoolnaam: tenant.name,
    geslacht: pick(["Man", "Vrouw", "Anders / zeg ik liever niet"], i),
    leeftijd: 38 + (i % 15),
    opleiding: pick(OPLEIDINGEN, i),
    jaren_onderwijs: 10 + (i % 20),
    ...plcColumns("sl", 44, seed, BIAS.schoolleiding),
    created_by: null,
  };
}

function buildPlcDocenten(tenant, i) {
  const seed = i * 47 + tenant.id.length;
  return {
    tenant_id: tenant.id,
    schoolnaam: tenant.name,
    geslacht: pick(["Man", "Vrouw", "Anders / zeg ik liever niet"], i),
    leeftijd: 26 + (i % 25),
    opleiding: pick(OPLEIDINGEN, i),
    jaren_onderwijs: 2 + (i % 25),
    ...plcColumns("dd", 44, seed, BIAS.docenten),
    created_by: null,
  };
}

function buildPlcLeerlingen(tenant, i) {
  const seed = i * 53 + tenant.id.length;
  return {
    tenant_id: tenant.id,
    schoolnaam: tenant.name,
    geslacht: i % 2 === 0 ? "Jongen" : "Meisje",
    leeftijd: 9 + (i % 4),
    onderwijs_type: pick(ONDERWIJS_TYPES, i),
    leerjaar: pick(LEERJAREN, i),
    ...plcLeerlingColumns(seed, BIAS.plcLeerling),
    created_by: null,
  };
}

const BUILDERS = {
  lesobservatie_coaches: buildLesobservatie,
  zelfevaluatie: buildZelfevaluatie,
  leerlingfeedback: buildLeerlingfeedback,
  plc_schoolleiding: buildPlcSchoolleiding,
  plc_docenten: buildPlcDocenten,
  plc_leerlingen: buildPlcLeerlingen,
};

async function fetchTenants() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/tenants?select=id,name&id=neq.instituut&order=name`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Tenants ophalen mislukt: ${res.status} ${await res.text()}`);
  return res.json();
}

async function insertBatch(table, rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`${table} insert mislukt: ${res.status} ${await res.text()}`);
}

async function main() {
  const tenants = await fetchTenants();
  if (!tenants.length) {
    console.error("Geen scholen gevonden.");
    process.exit(1);
  }

  console.log(`Seed forms dummy data voor ${tenants.length} school(en)...\n`);

  for (const tenant of tenants) {
    console.log(`→ ${tenant.name} (${tenant.id})`);
    for (const [table, count] of Object.entries(TARGETS)) {
      const build = BUILDERS[table];
      const rows = Array.from({ length: count }, (_, i) => build(tenant, i));
      const chunkSize = 25;
      for (let offset = 0; offset < rows.length; offset += chunkSize) {
        await insertBatch(table, rows.slice(offset, offset + chunkSize));
      }
      console.log(`   ${table}: ${count} rijen`);
    }
  }

  console.log("\nKlaar.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
