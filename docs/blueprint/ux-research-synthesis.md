# UX research synthesis — samenvatting

Dit document legt de belangrijkste UX/UI-conclusies uit het aangeleverde research-/blueprintdocument vast voor toekomstige product- en redesign-iteraties.

## Kernconclusies

- Rolgerichte cockpits zijn leidend: elke rol ziet de informatie die past bij de beslissing die die rol moet nemen.
- Rustige, scanbare dashboards werken beter dan generieke schermen vol metrics.
- AI hoort in de workflow als bewerkbaar en gelabeld concept, niet als autonome beslisser.
- Rapportage/export is een first-class feature, omdat schoolgesprekken en besluitvorming vaak via rapporten lopen.
- Design tokens moeten vanaf het begin primitive → semantic → component ondersteunen, zodat branding later in één laag gewijzigd kan worden.
- WCAG 2.2 AA is de gewenste baseline; voor tabletobservaties zijn 44×44px touch targets verstandig.
- Schoolleiders zien trends, voortgang en acties, maar geen ruwe observatiedata en geen docent-ranglijsten.

## Dashboardrichting

- Maximaal 3–5 headline-KPI's per cockpit.
- Elke metric heeft context: doel, trend, periode of benchmark.
- Gebruik line charts voor trends, sorted bars/bullet metrics voor vergelijkingen en sparklines voor snelle context.
- Vermijd pie/donut/gauge charts behalve voor eenvoudige single-target/single-part-to-whole situaties.

## Observatieformulier

Aanbevolen patroon:

- single-column;
- logische secties;
- prefilled context;
- criteria als losse kaarten;
- grote scoreknoppen;
- toelichting en bewijs per criterium;
- autosave én expliciet opslaan;
- concept-herstel;
- late/on-blur validatie;
- AI-conceptsamenvatting die bewerkbaar is en expliciet wordt goedgekeurd.

## Rapportgenerator

Aanbevolen flow:

1. Template kiezen.
2. Blokken samenstellen: samenvatting, KPI's, trend, acties, afspraken.
3. Live preview tonen.
4. Narratief bewerken.
5. Exporteren naar PDF/PPTX.

Rapporten zijn bedoeld als gespreksvoorbereiding, niet als beoordelingslijst.

## Navigatie en layout

- Linker sidebar is passend voor deze B2B-tool met meerdere secties.
- Topbar bevat context zoals school/project, search, notificaties en profiel.
- Editor-achtige schermen, zoals observaties en rapporten, mogen content links en instellingen/acties rechts tonen.

## Leidend voor redesign

Gebruik de aangeleverde Coursify/Sociafy-referenties voor:

- zachte cards;
- afgeronde containers;
- pastelaccenten;
- rustige analytics;
- duidelijke sidebars;
- topbar met search/profiel;
- editor-layouts met rechter settings-panel.

Gebruik ze niet om het product richting een klassieke cursus-LMS te trekken. Het kernproduct blijft leskwaliteit observeren en daarover rapporteren.
