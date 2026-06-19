/**
 * Vult de les "Data analytics" (18b6e231-565f-49e1-9340-9f7e1c41e759) met inhoud.
 * Eenmalig uitvoeren: node scripts/seed-data-analytics-lesson.mjs
 */

const LESSON_ID = "18b6e231-565f-49e1-9340-9f7e1c41e759";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://qifheelgfichghbsrxwo.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY ontbreekt.");
  process.exit(1);
}

const learningObjectives = [
  "Je kunt uitleggen wat data analytics betekent in een schoolcontext — en waarom data dient om te leren, niet om af te rekenen.",
  "Je onderscheidt formatieve, proces- en uitkomstdata en benoemt waarvoor je elk type inzet.",
  "Je leest trends en ontwikkelfasen en formuleert een concrete vervolgstap voor het team.",
];

const blocks = [
  {
    id: "b_intro_h2",
    type: "heading",
    level: 2,
    text: "Waarom data in school?",
  },
  {
    id: "b_intro_rt",
    type: "richText",
    html: `<p>Scholen verzamelen veel informatie: toetsresultaten, observaties, aanwezigheid, enquêtes. <strong>Data analytics</strong> is het systematisch bekijken van die informatie om patronen te zien — niet om mensen te vergelijken, maar om beter te begrijpen <em>wat leerlingen en teams nodig hebben</em>.</p>
<p>Bij Het Leerinstituut geldt: data zijn pas waardevol als ze leiden tot een professioneel gesprek en een concrete vervolgstap. Deze les legt uit hoe je dat doet.</p>`,
  },
  {
    id: "b_callout_kern",
    type: "callout",
    tone: "info",
    title: "Onze uitgangspunten",
    text: "Data dienen het leren, niet het afrekenen. Schoolleiders zien trends en gespreksonderwerpen — geen ranglijsten. We spreken in groeitaal: Startpunt → In ontwikkeling → Stevig zichtbaar → Voorbeeldpraktijk.",
  },
  {
    id: "b_def_h2",
    type: "heading",
    level: 2,
    text: "Wat is data analytics?",
  },
  {
    id: "b_def_rt",
    type: "richText",
    html: `<p>Data analytics betekent: gegevens verzamelen, ordenen en interpreteren om betere beslissingen te nemen. In schooltaal:</p>
<ul>
<li><strong>Verzamelen</strong> — welke signalen hebben we? (observaties, scores, voortgang)</li>
<li><strong>Ordenen</strong> — wat valt op over tijd, per vak, per team?</li>
<li><strong>Interpreteren</strong> — wat zegt dit over het leren, niet over de persoon?</li>
<li><strong>Bijsturen</strong> — welke interventie of afspraak volgt hieruit?</li>
</ul>
<p>Het gaat dus niet om één cijfer, maar om het <em>verhaal achter de cijfers</em> — samen met collega's, in een veilige professionele cultuur.</p>`,
  },
  {
    id: "b_data_h3",
    type: "heading",
    level: 3,
    text: "Drie soorten schooldata",
  },
  {
    id: "b_accordion",
    type: "accordion",
    items: [
      {
        id: "a_formatief",
        title: "Formatieve data — tussentijds zicht op leren",
        body: "Exit-tickets, korte checks, observatienotities tijdens de les. Doel: direct bijsturen. Vraag: wat hebben leerlingen nu nodig? Niet: een eindcijfer vastleggen.",
      },
      {
        id: "a_proces",
        title: "Procesdata — hoe het onderwijs is ingericht",
        body: "Lesbezoeken, voorbereiding, werkvormen, feedbackcultuur. Doel: de kwaliteit van instructie en betrokkenheid zichtbaar maken. In dit platform: observatiecriteria zoals heldere instructie en controle van begrip.",
      },
      {
        id: "a_uitkomst",
        title: "Uitkomstdata — wat leerlingen bereikt hebben",
        body: "Toetsen, centrale examens, leerlingvolgsystemen. Doel: patronen over tijd zien (groep, vak, school). Let op: nooit los lezen zonder context — koppel altijd aan proces en formatieve signalen.",
      },
    ],
  },
  {
    id: "b_div1",
    type: "divider",
  },
  {
    id: "b_cycle_h2",
    type: "heading",
    level: 2,
    text: "De analytics-cyclus",
  },
  {
    id: "b_timeline",
    type: "timeline",
    events: [
      {
        id: "e1",
        date: "Stap 1",
        title: "Verzamelen",
        body: "Bepaal welke vraag je beantwoord wilt hebben. Kies alleen data die daarbij helpen — minder is vaak meer.",
      },
      {
        id: "e2",
        date: "Stap 2",
        title: "Ordenen & visualiseren",
        body: "Zet data in trends, gemiddelden of faseverdelingen. Aggregaten (team/school) in plaats van individuele ranglijsten.",
      },
      {
        id: "e3",
        date: "Stap 3",
        title: "Bespreken in het team",
        body: "Stel diagnostische vragen: wat valt op? Wat verklaren we? Wat is onze vervolgstap? Houd psychologische veiligheid.",
      },
      {
        id: "e4",
        date: "Stap 4",
        title: "Bijsturen & opvolgen",
        body: "Kies één concrete actie. Plan een vervolgmoment om te zien of de interventie effect heeft.",
      },
    ],
  },
  {
    id: "b_gesprek_h2",
    type: "heading",
    level: 2,
    text: "Van cijfer naar gesprek",
  },
  {
    id: "b_tabs",
    type: "tabs",
    items: [
      {
        id: "t_trend",
        label: "Trend",
        body: "Kijk naar richting over meerdere momenten: gaat controle van begrip omhoog? Stagnatie is ook informatie — het vraagt om verdieping, niet om schuld.",
      },
      {
        id: "t_fase",
        label: "Ontwikkelfase",
        body: "Gebruik groeitaal: Startpunt, In ontwikkeling, Stevig zichtbaar, Voorbeeldpraktijk. Beschrijf wat zichtbaar is in gedrag en onderwijs, niet wie 'goed' of 'slecht' is.",
      },
      {
        id: "t_actie",
        label: "Vervolgstap",
        body: "Formuleer één actie die het team kan uitvoeren: bijv. 'In elke lesafsluiting maken we begrip controleren zichtbaar' of 'We koppelen observaties aan één gedeelde feedbackvraag'.",
      },
    ],
  },
  {
    id: "b_callout_platform",
    type: "callout",
    tone: "tip",
    title: "In dit platform",
    text: "De schoolleidercockpit toont bewust trends, faseverdeling en gespreksonderwerpen — geen ruwe observatiedata en geen docent-ranglijst. Rapporten zijn bedoeld als agenda voor het MT, niet als beoordelingslijst.",
  },
  {
    id: "b_flash_h3",
    type: "heading",
    level: 3,
    text: "Begrippen onthouden",
  },
  {
    id: "b_flashcards",
    type: "flashcards",
    cards: [
      { id: "f1", front: "Formatief evalueren", back: "Tussentijds zicht op leren om het onderwijs bij te sturen." },
      { id: "f2", front: "Aggregaat", back: "Samenvatting op team- of schoolniveau — geen individuele ranking." },
      { id: "f3", front: "Trend", back: "Ontwikkeling over meerdere meetmomenten; richting telt meer dan één score." },
      { id: "f4", front: "Groeitaal", back: "Taal over proces en vervolgstap, niet over vaste eigenschappen." },
    ],
  },
  {
    id: "b_sort",
    type: "sort",
    prompt: "Zet de stappen van de analytics-cyclus in de juiste volgorde:",
    items: [
      { id: "s2", text: "Verzamelen" },
      { id: "s4", text: "Ordenen & visualiseren" },
      { id: "s1", text: "Bespreken in het team" },
      { id: "s3", text: "Bijsturen & opvolgen" },
    ],
  },
  {
    id: "b_kc",
    type: "knowledgeCheck",
    question: "Wat is het primaire doel van data analytics in een schoolcontext volgens Het Leerinstituut?",
    multiple: false,
    options: [
      { id: "o1", text: "Docenten vergelijken en rangschikken", correct: false },
      { id: "o2", text: "Leren zichtbaar maken en een vervolgstap formuleren", correct: true },
      { id: "o3", text: "Zo veel mogelijk cijfers verzamelen", correct: false },
      { id: "o4", text: "Eindoordeel vormen over individuele prestaties", correct: false },
    ],
    hint: "Denk aan de kernboodschap: data dienen het leren.",
    feedbackCorrect: "Precies — analytics ondersteunt professioneel gesprek en bijsturing.",
    feedbackIncorrect: "Bekijk de callout 'Onze uitgangspunten' nog eens.",
  },
  {
    id: "b_open",
    type: "openQuestion",
    question: "Welke data bron op jouw school zou je het komende kwartaal willen bespreken in het team — en welke ene vraag zou je daarbij stellen?",
    sampleAnswer: "Bijv.: observaties op 'controle van begrip' — Vraag: zien we een stijgende trend als we exit-tickets structureel inzetten?",
  },
  {
    id: "b_quote",
    type: "quote",
    text: "Als een functie het makkelijk maakt om mensen te vergelijken of af te rekenen, is dat een waarschuwingssignaal.",
    attribution: "Identiteit — Het Leerinstituut",
  },
];

const payload = {
  title: "Data analytics: van cijfers naar gesprek",
  learning_objectives: learningObjectives,
  blocks,
  updated_at: new Date().toISOString(),
};

const res = await fetch(`${SUPABASE_URL}/rest/v1/lessons?id=eq.${LESSON_ID}`, {
  method: "PATCH",
  headers: {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
  body: JSON.stringify(payload),
});

if (!res.ok) {
  console.error("Update mislukt:", res.status, await res.text());
  process.exit(1);
}

const data = await res.json();
console.log("Les bijgewerkt:", data[0]?.title, "—", data[0]?.blocks?.length, "blokken");
