import type {
  AuditEvent,
  Invitation,
  LessonMaterial,
  Observation,
  Project,
  Report,
  ReportTemplate,
  Tenant,
  User,
} from "./types";

export const tenants: Tenant[] = [
  { id: "school-noord", name: "OBS De Noordster", region: "Amsterdam-Noord", status: "active", learnerCount: 412 },
  { id: "school-zuid", name: "KC Het Kompas", region: "Rotterdam-Zuid", status: "setup", learnerCount: 287 },
  { id: "instituut", name: "Het Leerinstituut", region: "Landelijk", status: "active", learnerCount: 0 },
];

export const users: User[] = [
  {
    id: "u-opleider-noord",
    name: "Sanne de Vries",
    email: "sanne@leerinstituut.test",
    role: "school_opleider",
    tenantId: "school-noord",
    avatarInitials: "SV",
  },
  {
    id: "u-leider-noord",
    name: "Murat Kaya",
    email: "murat@noordster.test",
    role: "school_leider",
    tenantId: "school-noord",
    avatarInitials: "MK",
  },
  {
    id: "u-docent-noord",
    name: "Eva Jansen",
    email: "eva@noordster.test",
    role: "docent",
    tenantId: "school-noord",
    avatarInitials: "EJ",
  },
  {
    id: "u-admin",
    name: "Nora Bakker",
    email: "admin@leerinstituut.test",
    role: "admin",
    tenantId: "instituut",
    avatarInitials: "NB",
  },
  {
    id: "u-opleider-zuid",
    name: "Ilias El Amrani",
    email: "ilias@leerinstituut.test",
    role: "school_opleider",
    tenantId: "school-zuid",
    avatarInitials: "IE",
  },
  {
    id: "u-docent-zuid",
    name: "Mila van Dijk",
    email: "mila@kompas.test",
    role: "docent",
    tenantId: "school-zuid",
    avatarInitials: "MD",
  },
];

export const criteriaTemplate = [
  {
    id: "c-instructie",
    title: "Heldere instructie",
    description: "Leerlingen weten wat ze leren, waarom dat belangrijk is en welke stappen volgen.",
  },
  {
    id: "c-activering",
    title: "Actieve betrokkenheid",
    description: "De les bevat werkvormen waardoor leerlingen zichtbaar denken, oefenen en feedback gebruiken.",
  },
  {
    id: "c-differentiatie",
    title: "Afstemming op verschillen",
    description: "De leraar past vragen, ondersteuning en tempo aan op wat leerlingen nodig hebben.",
  },
  {
    id: "c-afsluiting",
    title: "Controle van begrip",
    description: "Aan het einde is helder wat leerlingen beheersen en welke vervolgstap nodig is.",
  },
];

export const projects: Project[] = [
  {
    id: "p-noord-kwaliteit",
    tenantId: "school-noord",
    title: "Verbetertraject instructiekwaliteit",
    description: "Drie observatierondes gericht op expliciete directe instructie en feedbackcultuur.",
    status: "actief",
    startDate: "2026-04-01",
    endDate: "2026-10-01",
    participants: ["u-opleider-noord", "u-leider-noord", "u-docent-noord"],
    materialIds: ["m-noord-edi", "m-noord-feedback"],
    observationIds: ["o-noord-1", "o-noord-2"],
  },
  {
    id: "p-zuid-start",
    tenantId: "school-zuid",
    title: "Startmeting leerklimaat",
    description: "Nulmeting voor nieuwe omgeving met focus op routines en leerlingenactivatie.",
    status: "gepland",
    startDate: "2026-06-20",
    endDate: "2026-09-15",
    participants: ["u-opleider-zuid", "u-docent-zuid"],
    materialIds: ["m-zuid-routines"],
    observationIds: ["o-zuid-1"],
  },
];

export const materials: LessonMaterial[] = [
  {
    id: "m-noord-edi",
    tenantId: "school-noord",
    ownerId: "u-docent-noord",
    projectId: "p-noord-kwaliteit",
    title: "Lesopzet EDI - breuken vergelijken",
    type: "text",
    description: "Voorbereiding met lesdoel, begeleide inoefening en exit-ticket.",
    updatedAt: "2026-06-17T09:12:00Z",
    sharedWithRole: ["docent", "school_opleider"],
  },
  {
    id: "m-noord-feedback",
    tenantId: "school-noord",
    ownerId: "u-opleider-noord",
    projectId: "p-noord-kwaliteit",
    title: "Voorbeeldvideo feedbackvragen",
    type: "video",
    description: "Korte clip met feedbackvragen op procesniveau.",
    updatedAt: "2026-06-14T13:40:00Z",
    sharedWithRole: ["docent", "school_opleider", "school_leider"],
  },
  {
    id: "m-zuid-routines",
    tenantId: "school-zuid",
    ownerId: "u-docent-zuid",
    projectId: "p-zuid-start",
    title: "Audio-reflectie start routines",
    type: "audio",
    description: "Reflectie van het team op routines aan het begin van de les.",
    updatedAt: "2026-06-15T10:00:00Z",
    sharedWithRole: ["docent", "school_opleider"],
  },
];

export const observations: Observation[] = [
  {
    id: "o-noord-1",
    tenantId: "school-noord",
    projectId: "p-noord-kwaliteit",
    teacherId: "u-docent-noord",
    observerId: "u-opleider-noord",
    lessonTitle: "Breuken vergelijken",
    subject: "Rekenen groep 7",
    observedAt: "2026-06-18T10:15:00Z",
    status: "draft",
    criteria: criteriaTemplate.map((criterion, index) => ({
      ...criterion,
      score: index === 0 ? 4 : index === 1 ? 3 : null,
      note:
        index === 0
          ? "Lesdoel stond zichtbaar en werd in leerlingtaal herhaald."
          : index === 1
            ? "Sterke denkvragen, maar nog niet alle leerlingen kwamen actief aan bod."
            : "",
      evidence:
        index === 0
          ? [{ id: "ev-1", type: "note", label: "Bordfoto: stappenplan links naast lesdoel.", createdAt: "2026-06-18T10:21:00Z" }]
          : [],
    })),
  },
  {
    id: "o-noord-2",
    tenantId: "school-noord",
    projectId: "p-noord-kwaliteit",
    teacherId: "u-docent-noord",
    observerId: "u-opleider-noord",
    lessonTitle: "Tekstbegrip - signaalwoorden",
    subject: "Taal groep 6",
    observedAt: "2026-06-10T09:00:00Z",
    status: "completed",
    aiDraft: {
      id: "ai-noord-2",
      label: "AI-concept",
      text: "De les liet een duidelijke opbouw zien met voldoende modelen. De belangrijkste ontwikkelkans ligt in het explicieter controleren van begrip voordat leerlingen zelfstandig verder werken.",
      generatedAt: "2026-06-10T10:10:00Z",
      sourceCriterionIds: ["c-instructie", "c-afsluiting"],
      approvedAt: "2026-06-10T10:22:00Z",
      approvedBy: "u-opleider-noord",
    },
    criteria: criteriaTemplate.map((criterion, index) => ({
      ...criterion,
      score: [4, 3, 3, 2][index],
      note: ["Sterke modelling.", "Veel korte beurten.", "Extra scaffolds voor enkele leerlingen.", "Exit-ticket ontbrak."][index],
      evidence: [],
    })),
  },
  {
    id: "o-zuid-1",
    tenantId: "school-zuid",
    projectId: "p-zuid-start",
    teacherId: "u-docent-zuid",
    observerId: "u-opleider-zuid",
    lessonTitle: "Start van de dag",
    subject: "Groep 5",
    observedAt: "2026-06-21T08:45:00Z",
    status: "planned",
    criteria: criteriaTemplate.map((criterion) => ({ ...criterion, score: null, note: "", evidence: [] })),
  },
];

export const reportTemplates: ReportTemplate[] = [
  {
    id: "rt-gesprek",
    name: "Gespreksklaar kwaliteitsrapport",
    description: "Samenvatting, KPI's, trend, acties en afspraken voor het schoolgesprek.",
    blocks: ["summary", "kpi", "trend", "actions", "agreements"],
  },
];

export const reports: Report[] = [
  {
    id: "r-noord-juni",
    tenantId: "school-noord",
    projectId: "p-noord-kwaliteit",
    title: "Voortgang instructiekwaliteit — juni",
    status: "ready",
    templateId: "rt-gesprek",
    observationIds: ["o-noord-2"],
    updatedAt: "2026-06-17T14:10:00Z",
    blocks: [
      {
        id: "rb-summary",
        type: "summary",
        title: "Samenvatting",
        content:
          "De eerste ronde laat zien dat instructies duidelijker worden. De vervolgstap is consequent begrip controleren vóór zelfstandig werken.",
      },
      { id: "rb-actions", type: "actions", title: "Acties", content: "1. Exit-ticket per les. 2. Collegiale observatie op feedbackvragen." },
    ],
  },
];

export const invitations: Invitation[] = [
  { id: "inv-1", token: "welkom-noord", tenantId: "school-noord", email: "nieuwe-docent@noordster.test", role: "docent", status: "sent" },
];

export const auditEvents: AuditEvent[] = [
  {
    id: "audit-1",
    tenantId: "school-noord",
    actorId: "u-opleider-noord",
    action: "Samenvatting goedgekeurd",
    target: "Observatie Tekstbegrip",
    createdAt: "2026-06-10T10:22:00Z",
  },
  {
    id: "audit-2",
    tenantId: "school-noord",
    actorId: "u-opleider-noord",
    action: "Rapport geëxporteerd",
    target: "Voortgang instructiekwaliteit — juni",
    createdAt: "2026-06-17T14:30:00Z",
  },
];
