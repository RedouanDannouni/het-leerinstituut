/**
 * Vult les 2 "AI in school" (83d29960-fcf1-4940-8b6c-f2f1db9819ca) met inhoud.
 * Eenmalig uitvoeren: node scripts/seed-ai-lesson.mjs
 */

const LESSON_ID = "83d29960-fcf1-4940-8b6c-f2f1db9819ca";
const PREVIOUS_LESSON_ID = "18b6e231-565f-49e1-9340-9f7e1c41e759";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://qifheelgfichghbsrxwo.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY ontbreekt.");
  process.exit(1);
}

const learningObjectives = [
  "Je kunt uitleggen wat generatieve AI wel en niet doet in een professionele schoolcontext.",
  "Je herkent de drie principes van Het Leerinstituut over AI: concept, menselijke regie en privacy.",
  "Je formuleert wanneer AI ondersteuning biedt — en wanneer een mens het oordeel houdt.",
];

const blocks = [
  {
    id: "b_ai_intro_h2",
    type: "heading",
    level: 2,
    text: "Waarom AI op school?",
  },
  {
    id: "b_ai_intro_rt",
    type: "richText",
    html: `<p>AI-tools worden steeds normaler: ze helpen teksten formuleren, patronen herkennen en ideeën ordenen. In school kan dat tijd besparen — <em>als</em> je weet wanneer AI nuttig is en wanneer de professional zelf aan zet blijft.</p>
<p>In les 1 leerde je data analytics inzetten om te leren, niet af te rekenen. AI past in datzelfde kader: het ondersteunt het professionele gesprek, het vervangt het niet.</p>`,
  },
  {
    id: "b_ai_callout_kern",
    type: "callout",
    tone: "info",
    title: "Onze houding ten opzichte van AI",
    text: "AI is altijd een hulp, nooit de beslisser. Output is een concept dat je bewerkt en expliciet goedkeurt. Schooldata gaat niet naar externe AI-diensten — in dit platform draait AI lokaal en transparant.",
  },
  {
    id: "b_ai_def_h2",
    type: "heading",
    level: 2,
    text: "Wat bedoelen we met AI?",
  },
  {
    id: "b_ai_def_rt",
    type: "richText",
    html: `<p>Met <strong>generatieve AI</strong> bedoelen we software die tekst, samenvattingen of suggesties produceert op basis van invoer. Denk aan:</p>
<ul>
<li>een concept-samenvatting na een lesbezoek;</li>
<li>formuleringen voor feedback of een teamnotitie;</li>
<li>het structureren van observatienotities.</li>
</ul>
<p>AI <strong>kan niet</strong>: de context van jouw school kennen, psychologische veiligheid waarborgen, of verantwoordelijkheid dragen voor een oordeel. Dat blijft mensenwerk.</p>`,
  },
  {
    id: "b_ai_use_h3",
    type: "heading",
    level: 3,
    text: "Drie zinnige toepassingen in school",
  },
  {
    id: "b_ai_accordion",
    type: "accordion",
    items: [
      {
        id: "a_voorbereiding",
        title: "Voorbereiding — ideeën en structuur",
        body: "AI kan helpen om een lesopzet te structureren, vragen te bedenken of een concepttekst te schrijven. Jij beoordeelt of het past bij je leerlingen, je lesdoel en je schoolcontext. Gebruik output als startpunt, niet als eindproduct.",
      },
      {
        id: "a_observatie",
        title: "Observatie — AI-concept na een lesbezoek",
        body: "In dit platform genereert AI een conceptsamenvatting op basis van ingevulde criteria. De observator leest, bewerkt en keurt expliciet goed voordat iets in een rapport komt. Label: altijd 'AI-concept'.",
      },
      {
        id: "a_analyse",
        title: "Analyse — patronen zichtbaar maken",
        body: "In combinatie met data analytics kan AI helpen om notities of trends te ordenen. Let op: nooit individuele docenten ranken of automatisch beoordelen. AI ondersteunt interpretatie; het team neemt de beslissing.",
      },
    ],
  },
  {
    id: "b_ai_div1",
    type: "divider",
  },
  {
    id: "b_ai_regels_h2",
    type: "heading",
    level: 2,
    text: "Drie regels voor verantwoord gebruik",
  },
  {
    id: "b_ai_tabs",
    type: "tabs",
    items: [
      {
        id: "t_concept",
        label: "1. Altijd concept",
        body: "AI-output is nooit definitief. Het staat gelabeld als concept, is bewerkbaar en wordt pas bruikbaar na menselijke goedkeuring. In rapporten: alleen goedgekeurde teksten.",
      },
      {
        id: "t_regie",
        label: "2. Menselijke regie",
        body: "De observator, docent of schoolleider blijft eigenaar van het oordeel. AI mag formuleren en ordenen; jij bepaalt wat klopt, wat ontbreekt en wat de vervolgstap is.",
      },
      {
        id: "t_privacy",
        label: "3. Privacy & veiligheid",
        body: "Schooldata is gevoelig. In dit platform gaat geen observatiedata naar externe AI-diensten. AI draait lokaal en deterministisch — transparant en binnen de tenant-scheiding per school.",
      },
    ],
  },
  {
    id: "b_ai_flow_h2",
    type: "heading",
    level: 2,
    text: "AI in de observatieflow",
  },
  {
    id: "b_ai_timeline",
    type: "timeline",
    events: [
      {
        id: "e1",
        date: "Stap 1",
        title: "Observeren",
        body: "Vul criteria in met scores, toelichting en eventueel bewijs. Dit is jouw professionele waarneming — nog geen AI.",
      },
      {
        id: "e2",
        date: "Stap 2",
        title: "AI-concept genereren",
        body: "Klik op 'AI-concept genereren'. Het systeem stelt een samenvatting op in groeitaal, gebaseerd op wat je hebt ingevuld.",
      },
      {
        id: "e3",
        date: "Stap 3",
        title: "Bewerken & controleren",
        body: "Lees kritisch: klopt de toon? Mist context? Past het bij wat je gezien hebt? Pas de tekst aan — goedkeuring wordt gereset bij wijzigingen.",
      },
      {
        id: "e4",
        date: "Stap 4",
        title: "Goedkeuren & rapporteren",
        body: "Keur expliciet goed. Pas daarna kan de samenvatting in een rapport. Zo blijft traceerbaar wie verantwoordelijk is.",
      },
    ],
  },
  {
    id: "b_ai_callout_letop",
    type: "callout",
    tone: "let-op",
    title: "Externe AI-tools",
    text: "ChatGPT, Copilot en vergelijkbare tools kunnen nuttig zijn voor algemene voorbereiding — maar voer geen leerlinggegevens, observatienotities of schoolrapporten in bij externe diensten. Gebruik voor schoolgebonden werk het platform of afgesproken, veilige kanalen.",
  },
  {
    id: "b_ai_flash_h3",
    type: "heading",
    level: 3,
    text: "Begrippen onthouden",
  },
  {
    id: "b_ai_flashcards",
    type: "flashcards",
    cards: [
      { id: "f1", front: "AI-concept", back: "Door AI gegenereerde tekst die altijd bewerkt en goedgekeurd moet worden." },
      { id: "f2", front: "Generatieve AI", back: "Software die nieuwe tekst of samenvattingen produceert op basis van invoer." },
      { id: "f3", front: "Menselijke regie", back: "De professional blijft eigenaar van het oordeel; AI ondersteunt alleen." },
      { id: "f4", front: "Deterministisch", back: "Zelfde invoer geeft voorspelbare output — geen black box naar externe partijen." },
    ],
  },
  {
    id: "b_ai_sort",
    type: "sort",
    prompt: "Zet de stappen van de AI-conceptflow in de juiste volgorde:",
    items: [
      { id: "s1", text: "Observeren en criteria invullen" },
      { id: "s2", text: "AI-concept genereren" },
      { id: "s3", text: "Tekst bewerken en controleren" },
      { id: "s4", text: "Expliciet goedkeuren" },
    ],
  },
  {
    id: "b_ai_kc",
    type: "knowledgeCheck",
    question: "Wanneer mag een AI-samenvatting in een rapport verschijnen?",
    multiple: false,
    options: [
      { id: "o1", text: "Direct na het genereren, zonder controle", correct: false },
      { id: "o2", text: "Als de observator de tekst heeft bewerkt en expliciet goedgekeurd", correct: true },
      { id: "o3", text: "Alleen als de schoolleider het heeft geschreven", correct: false },
      { id: "o4", text: "Automatisch wanneer alle criteria zijn ingevuld", correct: false },
    ],
    hint: "Denk aan de regel: altijd concept, menselijke regie.",
    feedbackCorrect: "Juist — pas na bewerken en goedkeuren is het rapportage-klaar.",
    feedbackIncorrect: "Bekijk de timeline 'AI in de observatieflow' nog eens.",
  },
  {
    id: "b_ai_open",
    type: "openQuestion",
    question: "Noem één taak in jouw werk waar AI je zou kunnen helpen — en één taak waar jij het oordeel absoluut zelf wilt houden.",
    sampleAnswer: "Bijv. helpen: eerste opzet van een teamnotitie. Zelf houden: het gesprek met een docent na een observatie.",
  },
  {
    id: "b_ai_quote",
    type: "quote",
    text: "De mens blijft eigenaar van het oordeel — en is de rol van AI transparant.",
    attribution: "Identiteit — Het Leerinstituut",
  },
];

const payload = {
  title: "AI in school: hulp, geen beslisser",
  learning_objectives: learningObjectives,
  blocks,
  requires_lesson_id: PREVIOUS_LESSON_ID,
  position: 1,
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
