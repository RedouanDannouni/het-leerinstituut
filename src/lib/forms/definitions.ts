import type {
  FormDefinition,
  MetaField,
  RatingGroup,
  RatingItem,
  ScaleOption,
  ScaleVariant,
} from "./types";

// ---------------------------------------------------------------------------
// Antwoordschalen (4-punt Likert). Labels verschillen per doelgroep.
// ---------------------------------------------------------------------------

export const SCALES: Record<ScaleVariant, ScaleOption[]> = {
  leskwaliteit: [
    { value: 1, label: "Ontwikkelpunt", description: "(nog) niet of nauwelijks zichtbaar" },
    { value: 2, label: "Lerend", description: "soms zichtbaar, nog niet consistent" },
    { value: 3, label: "Bekwaam", description: "regelmatig en consistent zichtbaar" },
    { value: 4, label: "Gevorderd", description: "structureel en ook bij anderen zichtbaar" },
  ],
  plc: [
    { value: 1, label: "Nooit" },
    { value: 2, label: "Soms" },
    { value: 3, label: "Vaak" },
    { value: 4, label: "Altijd" },
  ],
};

// ---------------------------------------------------------------------------
// Gedeelde meta-veldopties
// ---------------------------------------------------------------------------

const GENDER_OPTIONS = ["Man", "Vrouw", "Anders / zeg ik liever niet"];

// ---------------------------------------------------------------------------
// De 6 bouwstenen (gebruikt door lesobservatie, zelfevaluatie, leerlingfeedback)
// ---------------------------------------------------------------------------

interface Bouwsteen {
  id: number;
  code: string; // "b1".."b6"
  label: string;
  from: number;
  to: number;
}

const BOUWSTENEN: Bouwsteen[] = [
  { id: 1, code: "b1", label: "Bouwsteen 1: Beheersingsgericht leren", from: 1, to: 4 },
  { id: 2, code: "b2", label: "Bouwsteen 2: Doelgericht leren", from: 5, to: 9 },
  { id: 3, code: "b3", label: "Bouwsteen 3: Zelfregulerend leren", from: 10, to: 13 },
  { id: 4, code: "b4", label: "Bouwsteen 4: Effectieve Feedback", from: 14, to: 18 },
  { id: 5, code: "b5", label: "Bouwsteen 5: Bevorderen van een positief leerklimaat", from: 19, to: 23 },
  { id: 6, code: "b6", label: "Bouwsteen 6: Flexibel differentiëren", from: 24, to: 28 },
];

function bouwsteenGroups(texts: Record<number, string>, withAnalyse: boolean): RatingGroup[] {
  return BOUWSTENEN.map((b) => {
    const items: RatingItem[] = [];
    for (let nr = b.from; nr <= b.to; nr += 1) {
      items.push({ column: `${b.code}_q${nr}`, nr, text: texts[nr] });
    }
    const group: RatingGroup = { key: b.code, label: b.label, icon: b.code, items };
    if (withAnalyse) {
      group.analyseColumn = `${b.code}_analyse`;
      group.analyseLabel = "Sterkte-ontwikkelanalyse";
    }
    return group;
  });
}

// ---------------------------------------------------------------------------
// Vraagteksten — Lesobservatie (coaches): "De leraar..."
// ---------------------------------------------------------------------------

const COACH_TEXTS: Record<number, string> = {
  1: "De leraar haalt relevante voorkennis op en stemt hier het lesvervolg op af.",
  2: "De leraar geeft bedenktijd en willekeurige beurten aan alle leerlingen.",
  3: "De leraar past formatief handelen toe om het leren zichtbaar te maken en te optimaliseren.",
  4: "De leraar evalueert voortdurend of leerlingen een beheersingsniveau van minimaal 80% bereiken voordat nieuwe stof wordt geïntroduceerd.",
  5: "De leraar stelt aan het begin van de les heldere, meetbare leerdoelen vast en controleert of leerlingen de leerdoelen begrijpen.",
  6: "De leraar gebruikt succescriteria om de voortgang te beoordelen.",
  7: "De leraar geeft duidelijke, gestructureerde en uitdagende instructie, gericht op de leerdoelen. De leraar maakt zichtbaar hoe de leerdoelen samenhangen met eerdere en toekomstige leerstof.",
  8: "De leraar gebruikt praktische voorbeelden die aansluiten bij de leefwereld van leerlingen om de leerdoelen uit te leggen.",
  9: "De leraar controleert expliciet of de leerdoelen tijdens de les behaald zijn en communiceert dit met de leerlingen.",
  10: "De leraar ondersteunt leerlingen bij het aanleren van zelfregulerende vaardigheden en modelleert het toepassen ervan.",
  11: "De leraar biedt effectieve leerstrategieën en modelleert het toepassen ervan.",
  12: "De leraar laat leerstof verwerken via activerende werkvormen.",
  13: "De leraar herhaalt de stof op diverse manieren en betrekt de leerlingen actief. De leraar bespreekt strategieën om door te zetten bij moeilijkheden (emotieregulatie, motivatie, veerkracht).",
  14: "De leraar geeft specifieke feed-up, feedback en feed-forward gericht op taak, proces en zelfsturing.",
  15: "De leraar geeft tijdig feedback die leerlingen kunnen gebruiken om hun leren te verbeteren.",
  16: "De leraar stimuleert kwaliteitsbesef onder leerlingen en organiseert hier werkvormen voor.",
  17: "De leraar stimuleert peer feedback onder leerlingen.",
  18: "De leraar geeft feedback passend bij het punt waar de leerling(en) zich bevindt in het leerproces.",
  19: "De leraar noemt leerlingen bij naam en besteedt aandacht aan hun welbevinden.",
  20: "De leraar toont modelgedrag in cognitieve en sociale aspecten.",
  21: "De leraar moedigt een leerklimaat aan waar fouten maken toegestaan is.",
  22: "De leraar benoemt gewenst gedrag en spreekt onvoorwaardelijke waardering uit zonder dit te vermengen met feedbackinformatie. De leraar reageert consequent, duidelijk en rechtvaardig op ongewenst gedrag.",
  23: "De leraar stimuleert actieve betrokkenheid en participatie van alle leerlingen.",
  24: "De leraar past onderwijstijd, -inhoud en -ondersteuning aan op verschillen in de klas.",
  25: "De leraar gebruikt technieken zoals pre-teaching, tutoring, en verlengde instructie.",
  26: "De leraar implementeert didactische ondersteuning zoals scaffolding en modeling effectief.",
  27: "De leraar zorgt dat alle leerlingen succeservaringen opdoen en leert hoe zij succes voor zichzelf kunnen organiseren.",
  28: "De leraar groepeert heterogeen en/of flexibel.",
};

// ---------------------------------------------------------------------------
// Vraagteksten — Zelfevaluatie (leraar): "Ik..."
// ---------------------------------------------------------------------------

const ZELF_TEXTS: Record<number, string> = {
  1: "Ik haal relevante voorkennis op en stem hier het lesvervolg op af.",
  2: "Ik geef bedenktijd en willekeurige beurten aan alle leerlingen.",
  3: "Ik pas formatieve evaluatie toe om het leren zichtbaar te maken en optimaliseer het lesgeven.",
  4: "Ik controleer of leerlingen een beheersingsniveau van minimaal 80% bereiken voordat ik nieuwe stof introduceer.",
  5: "Ik stel aan het begin van de les heldere, meetbare leerdoelen vast en controleer of leerlingen deze leerdoelen begrijpen.",
  6: "Ik gebruik succescriteria om de voortgang te beoordelen.",
  7: "Ik geef duidelijke, gestructureerde en uitdagende instructie, gericht op de leerdoelen.",
  8: "Ik gebruik praktische voorbeelden die aansluiten bij de leefwereld van leerlingen om de leerdoelen uit te leggen.",
  9: "Ik controleer expliciet of de leerdoelen tijdens de les behaald zijn en communiceer dit met de leerlingen.",
  10: "Ik ondersteun leerlingen bij het ontwikkelen van zelfregulerende vaardigheden en modelleer het toepassen ervan.",
  11: "Ik bied (vakinhoudelijke) leerstrategieën aan en modelleer het toepassen ervan.",
  12: "Ik laat leerstof verwerken via activerende werkvormen.",
  13: "Ik herhaal de stof op diverse manieren en betrek de leerlingen actief.",
  14: "Ik geef specifieke feed-up, feedback en feed-forward gericht op taak, proces en zelfsturing.",
  15: "Ik geef tijdig feedback die leerlingen kunnen gebruiken om hun leren te verbeteren.",
  16: "Ik stimuleer kwaliteitsbesef onder leerlingen en organiseer hier werkvormen voor.",
  17: "Ik stimuleer peer feedback onder leerlingen.",
  18: "Ik geef feedback passend bij het punt waar de leerling(en) zich bevindt in het leerproces.",
  19: "Ik noem leerlingen bij naam en besteed aandacht aan hun welbevinden.",
  20: "Ik toon modelgedrag in cognitieve en sociale aspecten.",
  21: "Ik moedig een leerklimaat aan waar fouten maken toegestaan is.",
  22: "Ik benoem gewenst gedrag en spreek onvoorwaardelijke waardering uit zonder dit te vermengen met feedbackinformatie.",
  23: "Ik stimuleer actieve betrokkenheid en participatie van alle leerlingen.",
  24: "Ik pas onderwijstijd, -inhoud en -ondersteuning aan op verschillen in de klas.",
  25: "Ik gebruik technieken zoals pre-teaching, tutoring, en verlengde instructie.",
  26: "Ik implementeer didactische ondersteuning zoals scaffolding en modeling effectief.",
  27: "Ik zorg dat alle leerlingen succeservaringen opdoen en leer hoe zij succes voor zichzelf kunnen organiseren.",
  28: "Ik groepeer heterogeen en/of flexibel.",
};

// ---------------------------------------------------------------------------
// Vraagteksten — Leerlingfeedback: "Onze leraar..."
// ---------------------------------------------------------------------------

const LEERLING_TEXTS: Record<number, string> = {
  1: "Onze leraar vraagt wat we al weten voordat we beginnen met het leren van iets nieuws.",
  2: "Onze leraar geeft ons tijd om na te denken en kiest willekeurig wie er antwoord geeft.",
  3: "Onze leraar gebruikt tests of activiteiten om te zien wat we leren.",
  4: "Onze leraar zorgt dat bijna iedereen het snapt voordat we verder gaan met nieuwe stof.",
  5: "Onze leraar vertelt ons duidelijk wat we moeten leren aan het begin van de les.",
  6: "Onze leraar laat ons weten hoe we kunnen zien of we goed bezig zijn.",
  7: "Onze leraar legt dingen duidelijk en uitdagend uit zodat we het doel van de les begrijpen.",
  8: "Onze leraar gebruikt voorbeelden die we kennen uit ons eigen leven om dingen uit te leggen.",
  9: "Onze leraar controleert of we hebben geleerd wat we moesten leren tijdens de les.",
  10: "Onze leraar helpt ons om zelf te leren plannen en organiseren.",
  11: "Onze leraar leert ons hoe we het beste kunnen leren en laat zien hoe dat moet.",
  12: "Onze leraar laat ons op verschillende manieren werken zodat we actief blijven leren.",
  13: "Onze leraar herhaalt belangrijke dingen op verschillende manieren zodat we het beter snappen.",
  14: "Onze leraar geeft ons duidelijke tips hoe we kunnen verbeteren bij taken, leren en zelfstandig werken.",
  15: "Onze leraar geeft ons snel feedback zodat we weten hoe we het doen.",
  16: "Onze leraar moedigt ons aan om trots te zijn op goed werk en helpt ons te zien hoe we kunnen verbeteren.",
  17: "Onze leraar zorgt dat we van elkaar kunnen leren door ons feedback aan elkaar te laten geven.",
  18: "Onze leraar geeft feedback op de taak waar we mee bezig zijn.",
  19: "Onze leraar kent ons bij naam en zorgt dat we ons goed voelen in de klas.",
  20: "Onze leraar laat goed gedrag zien in hoe we moeten omgaan met anderen.",
  21: "Onze leraar zegt dat het oké is om fouten te maken zodat we daarvan kunnen leren.",
  22: "Onze leraar laat ons weten wanneer we iets goed doen en helpt ons om dat te blijven doen.",
  23: "Onze leraar zorgt dat iedereen mee kan doen en betrokken is.",
  24: "Onze leraar verandert de lessen zodat ze passen bij wat we nodig hebben.",
  25: "Onze leraar geeft extra uitleg of aparte lessen voor wie dat nodig heeft.",
  26: "Onze leraar helpt ons op verschillende manieren zodat we allemaal kunnen leren.",
  27: "Onze leraar zorgt dat we ons succesvol voelen en helpt ons om zelf te zien hoe we succes kunnen bereiken.",
  28: "Onze leraar zorgt dat we in verschillende groepen werken, zodat iedereen het beste kan leren.",
};

// ---------------------------------------------------------------------------
// PLC — gedeelde vragen Q19-44 (identiek voor schoolleiding en docenten)
// ---------------------------------------------------------------------------

const PLC_SHARED_19_44: Record<number, string> = {
  19: "Ik vind dat op deze school de leerlingen over het algemeen goed kunnen samenwerken.",
  20: "Ik vind dat op deze school de leerlingen over het algemeen richtlijnen goed navolgen.",
  21: "Ik vind dat op deze school de leerlingen over het algemeen respect tonen voor leraren en medeleerlingen.",
  22: "Ik vind dat op deze school de leerlingen over het algemeen zich goed kunnen concentreren in de les.",
  23: "Ik vind dat op deze school de leerlingen over het algemeen veel inzicht hebben.",
  24: "Ik vind dat op deze school de leerlingen over het algemeen leergierig en nieuwsgierig zijn.",
  25: "Ik vind dat op deze school de leerlingen over het algemeen bereiken wat op basis van hun leeftijd kan worden verwacht (academisch).",
  26: "Ik vind dat op deze school de leerlingen over het algemeen creatief en innovatief zijn in hun denken.",
  27: "Ik vind dat op deze school de leerlingen over het algemeen goed omgaan met conflicten.",
  28: "Ik vind dat op deze school de leerlingen over het algemeen een positieve houding hebben.",
  29: "Ik vind dat op deze school de leerlingen over het algemeen empathisch zijn tegenover anderen.",
  30: "Wij handelen naar een gemeenschappelijke overtuiging die leren effectief maakt.",
  31: "Wij geloven dat alle leerlingen kunnen leren.",
  32: "Wij verklaren succes binnen de eigen invloedssfeer (zoals pedagogisch-didactische acties) in plaats van erbuiten (bv. ouderbetrokkenheid, motivatie v/d leerling etc.).",
  33: "Wij gebruiken data-analyse voor zelfreflectie en verbetering van ons handelen.",
  34: "Wij zijn eensgezind over wat er geleerd moet worden.",
  35: "Wij zijn eensgezind over hoe er geleerd moet worden.",
  36: "Wij hebben een duidelijk plan voor wat te doen als leerlingen niet leren of verder kunnen.",
  37: "De samenwerking binnen de school draagt bij aan de kwaliteit van ons onderwijs.",
  38: "Er is commitment binnen de school om voortdurend te leren en verbeteren.",
  39: "De kennis en kunde van alle onderwijsprofessionals worden ook in teamverband benut.",
  40: "Op school wordt zo veel mogelijk een gedeelde taal gebruikt bij het bespreken van wat, hoe en wanneer leerlingen leren.",
  41: "Wij zien erop toe dat we deze gedeelde taal ook richting leerlingen gebruiken.",
  42: "Ons onderwijs focust consequent op data-geïnformeerd verbeteren van leerresultaten.",
  43: "Wij zijn er ons bewust van dat al onze inspanningen worden beoordeeld op de meerwaarde voor het leren van alle leerlingen en niet enkel op onze goede bedoelingen.",
  44: "Alle andere activiteiten worden door ons tegen het licht gehouden en beoordeeld op de meerwaarde voor het leren van de leerlingen.",
};

const PLC_SCHOOLLEIDING_1_18: Record<number, string> = {
  1: "Ik communiceer duidelijk de missie, visie en doelen van onze school.",
  2: "Ik betrek leraren bij het formuleren van de visie en doelen van de school.",
  3: "Ik definieer en communiceer duidelijk de standaarden voor onze lespraktijk.",
  4: "Ik stimuleer actief een positief schoolklimaat en positief gedrag.",
  5: "Ik toon voorbeeldgedrag.",
  6: "Ik toon bereidheid om te leren en samen te werken.",
  7: "Ik handel rechtvaardig, redelijk en integer.",
  8: "Ik bevorder effectieve samenwerking.",
  9: "Ik werk planmatig aan professionele ontwikkeling van het personeel.",
  10: "Ik zorg voor voldoende tijd en ruimte voor samenwerking tussen leraren.",
  11: "Ik zorg dat de benodigde hulpmiddelen en ondersteuning gemakkelijk toegankelijk zijn voor leraren.",
  12: "Ik hanteer en handhaaf hoge standaarden voor mezelf en anderen.",
  13: "Ik creëer een cultuur waarin leraren zich competent en professioneel gemotiveerd voelen.",
  14: "Ik toon oprechte interesse in het welzijn van het personeel.",
  15: "Ik bevorder een cultuur van verantwoordelijkheid die belangrijker is dan autoriteit.",
  16: "Ik erken regelmatig de capaciteiten en groei van leraren.",
  17: "Ik vier collectieve en individuele successen binnen de school.",
  18: "Ik spreek onvoorwaardelijke waardering uit.",
};

const PLC_DOCENTEN_1_18: Record<number, string> = {
  1: "De schoolleiding communiceert duidelijk de missie, visie en doelen van onze school.",
  2: "De schoolleiding betrekt leraren bij het formuleren van de visie en doelen van de school.",
  3: "De schoolleiding definieert en communiceert duidelijk de standaarden voor onze lespraktijk.",
  4: "De schoolleiding stimuleert actief een positief schoolklimaat en positief gedrag.",
  5: "De schoolleiding toont voorbeeldgedrag.",
  6: "De schoolleiding toont bereidheid om te leren en samen te werken.",
  7: "De schoolleiding handelt rechtvaardig, redelijk en integer.",
  8: "De schoolleiding bevordert effectieve samenwerking.",
  9: "De schoolleiding werkt planmatig aan professionele ontwikkeling van het personeel.",
  10: "De schoolleiding zorgt voor voldoende tijd en ruimte voor samenwerking tussen leraren.",
  11: "De schoolleiding zorgt dat de benodigde hulpmiddelen en ondersteuning gemakkelijk toegankelijk zijn voor leraren.",
  12: "De schoolleiding hanteert en handhaaft hoge standaarden voor zichzelf en anderen.",
  13: "De schoolleiding creëert een cultuur waarin leraren zich competent en professioneel gemotiveerd voelen.",
  14: "De schoolleiding toont oprechte interesse in het welzijn van het personeel.",
  15: "De schoolleiding bevordert een cultuur van verantwoordelijkheid die belangrijker is dan autoriteit.",
  16: "De schoolleiding erkent regelmatig de capaciteiten en groei van leraren.",
  17: "De schoolleiding viert collectieve en individuele successen binnen de school.",
  18: "De schoolleiding spreekt onvoorwaardelijke waardering uit.",
};

const PLC_LEERLINGEN_TEXTS: Record<number, string> = {
  1: "Mijn leraren vinden dat ik goed kan samenwerken met anderen.",
  2: "Mijn leraren vinden dat ik mij aan de regels houd.",
  3: "Mijn leraren vinden dat ik respectvol ben naar hen en mijn klasgenoten.",
  4: "Mijn leraren vinden dat ik me goed kan concentreren in de les.",
  5: "Mijn leraren vinden dat ik slim ben.",
  6: "Mijn leraren vinden dat ik graag leer en nieuwsgierig ben.",
  7: "Mijn leraren vinden dat ik goed presteer voor mijn leeftijd.",
  8: "Mijn leraren vinden dat ik creatief en vernieuwend ben in mijn denken.",
  9: "Mijn leraren vinden dat ik goed met ruzies kan omgaan.",
  10: "Mijn leraren vinden dat ik een positieve houding heb.",
  11: "Mijn leraren vinden dat ik me goed kan inleven in anderen.",
};

// ---------------------------------------------------------------------------
// PLC-groepen (clusters) bouwen
// ---------------------------------------------------------------------------

function ratingRange(prefix: string, from: number, to: number, texts: Record<number, string>): RatingItem[] {
  const items: RatingItem[] = [];
  for (let nr = from; nr <= to; nr += 1) {
    items.push({ column: `${prefix}_q${nr}`, nr, text: texts[nr] });
  }
  return items;
}

function plcGroups(prefix: string, lead1_18: Record<number, string>): RatingGroup[] {
  const texts = { ...lead1_18, ...PLC_SHARED_19_44 };
  return [
    { key: "say_it", label: "Communicatie (Say it)", items: ratingRange(prefix, 1, 3, texts) },
    { key: "model_it", label: "Voorbeeldgedrag tonen (Model it)", items: ratingRange(prefix, 4, 7, texts) },
    { key: "organize_it", label: "Organiseren (Organize for it)", items: ratingRange(prefix, 8, 11, texts) },
    { key: "protect_it", label: "Beschermen (Protect it)", items: ratingRange(prefix, 12, 15, texts) },
    { key: "reward_it", label: "Belonen (Reward it)", items: ratingRange(prefix, 16, 18, texts) },
    { key: "schoolaangepast", label: "Schoolaangepast gedrag", items: ratingRange(prefix, 19, 21, texts) },
    { key: "cognitief", label: "Cognitieve-motivatie gedrag", items: ratingRange(prefix, 22, 26, texts) },
    { key: "persoonlijk", label: "Persoonlijk-sociaal gedrag", items: ratingRange(prefix, 27, 29, texts) },
    { key: "overtuiging", label: "Gemeenschappelijke overtuiging", items: ratingRange(prefix, 30, 31, texts) },
    { key: "attributies", label: "Interne attributies", items: ratingRange(prefix, 32, 33, texts) },
    { key: "focus", label: "Focus op leren", items: ratingRange(prefix, 34, 36, texts) },
    { key: "samen", label: "Samen geraken we verder", items: ratingRange(prefix, 37, 39, texts) },
    { key: "jargon", label: "Hetzelfde (onderwijs)jargon", items: ratingRange(prefix, 40, 41, texts) },
    { key: "resultaat", label: "Resultaatgerichtheid", items: ratingRange(prefix, 42, 44, texts) },
  ];
}

const PLC_SECTIONS = [
  {
    label: "Sectie 1 — Schoolleiderschap",
    groupKeys: ["say_it", "model_it", "organize_it", "protect_it", "reward_it"],
  },
  {
    label: "Sectie 2 — Leerlinggedrag",
    groupKeys: ["schoolaangepast", "cognitief", "persoonlijk"],
  },
  {
    label: "Sectie 3 — PLC-cultuur",
    groupKeys: ["overtuiging", "attributies", "focus", "samen", "jargon", "resultaat"],
  },
];

// ---------------------------------------------------------------------------
// Formulierdefinities
// ---------------------------------------------------------------------------

const lesobservatieCoach: FormDefinition = {
  key: "lesobservatie-coach",
  table: "lesobservatie_coaches",
  title: "Lesobservatie (coach)",
  subtitle: "Externe observatie van een les door een coach/observant.",
  intro:
    "Het meest uitgebreide formulier: 28 beoordelingsvragen over 6 bouwstenen, plus een sterkte-ontwikkelanalyse per bouwsteen.",
  respondent: "Coach / observant",
  access: "auth",
  allowedRoles: ["coach", "admin", "planner"],
  scale: "leskwaliteit",
  meta: [
    { column: "email", label: "E-mailadres", input: "email", autofill: "email" },
    { column: "naam_observant", label: "Naam observant", input: "text", required: true, autofill: "naam" },
    {
      column: "type_meting",
      label: "Type meting",
      input: "select",
      options: ["Nulmeting", "Volgmeting", "Eindmeting"],
      required: true,
    },
    { column: "schoolnaam", label: "Schoolnaam", input: "text", required: true, autofill: "schoolnaam" },
    { column: "datum_observatie", label: "Datum observatie", input: "date", required: true, autofill: "datum-vandaag" },
    { column: "tijdstip_observatie", label: "Tijdstip observatie", input: "time", autofill: "tijd-nu" },
    { column: "naam_leraar", label: "Naam leraar", input: "text", required: true },
    { column: "klas", label: "Klas", input: "text" },
    { column: "vak", label: "Vak", input: "text" },
  ],
  generalNote: {
    column: "empirische_observatie",
    label: "Empirische observatie",
    input: "textarea",
    help: "Algemene observatienotities (niet gekoppeld aan een specifieke bouwsteen).",
  },
  groups: bouwsteenGroups(COACH_TEXTS, true),
};

const zelfevaluatie: FormDefinition = {
  key: "zelfevaluatie",
  table: "zelfevaluatie",
  title: "Zelfevaluatie (leraar)",
  subtitle: "Reflectie van de leraar op het eigen lesgedrag.",
  intro: "Spiegelformulier van de leerlingfeedback: dezelfde 28 vragen over 6 bouwstenen, geformuleerd vanuit 'Ik...'.",
  respondent: "Leraar (zelfreflectie)",
  access: "auth",
  allowedRoles: ["docent", "coach", "admin", "planner"],
  scale: "leskwaliteit",
  meta: [
    { column: "datum_zelfevaluatie", label: "Datum zelfevaluatie", input: "date", required: true, autofill: "datum-vandaag" },
    { column: "schoolnaam", label: "Schoolnaam", input: "text", autofill: "schoolnaam" },
    { column: "gender", label: "Gender", input: "select", options: GENDER_OPTIONS },
    { column: "leeftijd", label: "Leeftijd", input: "number" },
    { column: "hoogst_genoten_opleiding", label: "Hoogst genoten opleiding", input: "text" },
    { column: "lesgroep", label: "Lesgroep", input: "text" },
  ],
  groups: bouwsteenGroups(ZELF_TEXTS, false),
};

const leerlingfeedback: FormDefinition = {
  key: "leerlingfeedback",
  table: "leerlingfeedback",
  title: "Leerlingfeedback",
  subtitle: "Leerlingen geven feedback op het gedrag van hun leraar.",
  intro: "Spiegelformulier van de zelfevaluatie: 28 vragen over 6 bouwstenen, geformuleerd vanuit 'Onze leraar...'.",
  respondent: "Leerling",
  access: "anon",
  scale: "leskwaliteit",
  meta: [
    { column: "datum_leerlingfeedback", label: "Datum", input: "date", required: true, autofill: "datum-vandaag" },
    { column: "schoolnaam", label: "School", input: "text", autofill: "schoolnaam", locked: true },
    { column: "gender", label: "Ben je een jongen of een meisje?", input: "select", options: ["Jongen", "Meisje"] },
    { column: "leeftijd", label: "Wat is jouw leeftijd?", input: "number" },
    { column: "klas", label: "In welke klas zit je?", input: "text" },
  ],
  groups: bouwsteenGroups(LEERLING_TEXTS, false),
};

const plcSchoolleiding: FormDefinition = {
  key: "plc-schoolleiding",
  table: "plc_schoolleiding",
  title: "PLC-scan (schoolleiding)",
  subtitle: "Zelfreflectie van de schoolleider op leiderschap en schoolcultuur.",
  intro: "44 vragen in 3 secties: schoolleiderschap (Ik...), leerlinggedrag en PLC-cultuur.",
  respondent: "Schoolleider / directeur",
  access: "auth",
  allowedRoles: ["school_leider", "admin", "planner"],
  scale: "plc",
  meta: [
    { column: "schoolnaam", label: "Schoolnaam", input: "text", required: true, autofill: "schoolnaam" },
    { column: "geslacht", label: "Wat is uw geslacht?", input: "select", options: GENDER_OPTIONS },
    { column: "leeftijd", label: "Wat is uw leeftijd?", input: "number" },
    { column: "opleiding", label: "Wat is de hoogste opleiding die u heeft voltooid?", input: "text" },
    { column: "jaren_onderwijs", label: "Hoeveel jaar bent u al werkzaam in het onderwijs (dit jaar inbegrepen)?", input: "number" },
  ],
  groups: plcGroups("sl", PLC_SCHOOLLEIDING_1_18),
  sections: PLC_SECTIONS,
};

const plcDocenten: FormDefinition = {
  key: "plc-docenten",
  table: "plc_docenten",
  title: "PLC-scan (docenten)",
  subtitle: "360°-beoordeling van de schoolleiding door docenten + PLC-cultuur.",
  intro: "44 vragen: Q1-18 over de schoolleiding ('De schoolleiding...'), Q19-44 over leerlinggedrag en PLC-cultuur.",
  respondent: "Schooldocent / deelnemer",
  access: "auth",
  allowedRoles: ["docent", "coach", "admin", "planner"],
  scale: "plc",
  meta: [
    { column: "schoolnaam", label: "Schoolnaam", input: "text", required: true, autofill: "schoolnaam" },
    { column: "geslacht", label: "Wat is uw geslacht?", input: "select", options: GENDER_OPTIONS },
    { column: "leeftijd", label: "Wat is uw leeftijd?", input: "number" },
    { column: "opleiding", label: "Wat is de hoogste opleiding die u heeft voltooid?", input: "text" },
    { column: "jaren_onderwijs", label: "Hoeveel jaar bent u al werkzaam in het onderwijs (dit jaar inbegrepen)?", input: "number" },
  ],
  groups: plcGroups("dd", PLC_DOCENTEN_1_18),
  sections: PLC_SECTIONS,
};

const plcLeerlingen: FormDefinition = {
  key: "plc-leerlingen",
  table: "plc_leerlingen",
  title: "PLC-scan (leerlingen)",
  subtitle: "Leerlingen beoordelen hun eigen gedrag zoals zij denken dat hun leraren dat zien.",
  intro: "11 korte vragen in 3 categorieën. Alle vragen beginnen met 'Mijn leraren vinden dat ik...'.",
  respondent: "Leerling",
  access: "anon",
  scale: "plc",
  meta: [
    { column: "schoolnaam", label: "School", input: "text", autofill: "schoolnaam", locked: true },
    { column: "geslacht", label: "Ben je een jongen of een meisje?", input: "select", options: ["Jongen", "Meisje"] },
    { column: "leeftijd", label: "Wat is jouw leeftijd?", input: "number" },
    { column: "onderwijs_type", label: "Welk onderwijs volg je?", input: "text" },
    { column: "leerjaar", label: "In welk leerjaar zit je?", input: "text" },
  ],
  groups: [
    { key: "schoolaangepast", label: "Schoolaangepast gedrag", items: ratingRange("", 1, 3, PLC_LEERLINGEN_TEXTS).map(stripUnderscore) },
    { key: "cognitief", label: "Cognitieve-motivatie gedrag", items: ratingRange("", 4, 8, PLC_LEERLINGEN_TEXTS).map(stripUnderscore) },
    { key: "persoonlijk", label: "Persoonlijk-sociaal gedrag", items: ratingRange("", 9, 11, PLC_LEERLINGEN_TEXTS).map(stripUnderscore) },
  ],
};

// PLC-leerlingen gebruikt kolomnamen q1..q11 (zonder prefix).
function stripUnderscore(item: RatingItem): RatingItem {
  return { ...item, column: `q${item.nr}` };
}

export const FORM_DEFINITIONS: FormDefinition[] = [
  lesobservatieCoach,
  zelfevaluatie,
  leerlingfeedback,
  plcSchoolleiding,
  plcDocenten,
  plcLeerlingen,
];

export function getFormDefinition(key: string): FormDefinition | undefined {
  return FORM_DEFINITIONS.find((def) => def.key === key);
}
