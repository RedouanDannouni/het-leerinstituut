# PRD — Het Leerinstituut platform (v2: traject, planning & rollen)

> Status: **concept ter bespreking**. Dit document vertaalt de klantfeedback (juni 2026)
> naar heldere, planbare requirements en zet ze af tegen het bestaande fundament
> (`docs/blueprint/initial-product-blueprint.md`, `README.md`, `identiteit.md`).
>
> Lees dit samen met `identiteit.md`: dat is de toetssteen. Waar de feedback iets
> vraagt dat richting een afreken-/ranglijsttool neigt, kiezen we bewust de
> ontwikkelgerichte variant en leggen dat hier vast.

---

## 1. Doel van dit document

De klant (Het Leerinstituut) heeft feedback gegeven over hoe scholen — hún klanten —
het platform graag zien. Die feedback bevat veel goede ideeën maar is nog ongestructureerd.
Dit PRD doet drie dingen:

1. **Vertalen** — de feedback omzetten naar begrijpelijke begrippen, rollen en functies.
2. **Vergelijken** — laten zien wat al bestaat, wat nieuw is en wat verandert ten opzichte
   van de huidige blueprint en code.
3. **Plannen** — de scope opdelen in epics met user stories en een voorgestelde fasering,
   plus de technische impact (als brug naar een latere TDD).

Wat dit document **niet** is: een volledige technische ontwerpbeschrijving (TDD). Hoofdstuk
[10](#10-technische-impact-brug-naar-de-tdd) geeft de richting; de detail-TDD volgt apart.

---

## 2. Samenvatting in één blik

Het platform groeit van "observeren → rapporteren" naar een **end-to-end
begeleidingsplatform** rond een **traject** dat Het Leerinstituut met een school doorloopt:

```
intake/opdracht → traject samenstellen → coaches plannen → uitvoeren (observeren, trainen,
meten) → 360°-beeld opbouwen → live inzicht & rapportage → evalueren
```

De grootste veranderingen ten opzichte van vandaag:

| # | Verandering | Soort |
| --- | --- | --- |
| 1 | Nieuwe rol **Kwaliteitszorg & Planning** (planner) | Nieuw |
| 2 | **Opdrachtbeschrijving** als startpunt van elk traject | Nieuw |
| 3 | Configureerbaar **traject** met meet- en trainingsmomenten | Nieuw |
| 4 | **Drag-and-drop planning** van coaches (dagen/uren) | Nieuw |
| 5 | **360°-mapping** van coachbeoordeling, docent-zelfreflectie en leerlingfeedback | Nieuw |
| 6 | **Coach** als expliciete rol (vandaag heet die rol "schoolopleider") | Wijziging |
| 7 | **Docent**: zelfreflectie, lessen volgen, opdrachten maken/inleveren | Uitbreiding |
| 8 | **Schoolleider**: live data, coach-overzicht, modulevoortgang per docent | Uitbreiding |
| 9 | **Beheer**: batch-/multimodal upload (plakken, CSV, Excel) + blanco template | Uitbreiding |
| 10 | **Leerplatform**: traject in beeld, tussentijdse rapportage, opdrachten | Uitbreiding |
| 11 | **Publieke formulieren** buiten de inlogmuur + QR-code | Nieuw |

---

## 3. Vergelijking met de huidige documentatie

### 3.1 Wat blijft (fundament intact)

- **Rol-gestuurde cockpits** — elke rol start op een eigen overzicht. Blijft leidend; we
  voegen rollen toe.
- **Multi-tenant data-isolatie** (`tenantId`) — blijft, maar moet worden uitgebreid omdat
  een coach voor **meerdere scholen** werkt (zie [§10.2](#102-cross-tenant-coaches)).
- **Observatieformulier als kernscherm** — blijft het hart, maar wordt onderdeel van een
  groter traject en krijgt gezelschap van zelfreflectie- en leerlingformulieren.
- **AI als hulp, niet als beslisser** — blijft. Ook de 360°-mapping is dialoog-ondersteunend,
  geen automatisch oordeel.
- **Rapportage/export als first-class feature** — blijft en wordt uitgebreid met
  trajectgebonden, vrijgegeven rapportages.
- **Identiteit** — blijft de toetssteen. Cruciaal: schoolleiders zien geen docent-ranglijst.

### 3.2 Wat verandert

| Onderdeel | Vandaag | Wordt |
| --- | --- | --- |
| Rollen | 4: schoolopleider, schoolleider, docent, admin | 5–6: **coach** (was schoolopleider), schoolleider, docent, **planner (kwaliteitszorg)**, admin; + publieke gebruiker (geen login) |
| Observator | "Schoolopleider", vast aan één school | "Coach", inzetbaar over meerdere scholen via planning |
| Project | Losse `Project` met status en deelnemers | Onderdeel van een **traject** met stappen, planning en op te leveren rapportages |
| Beoordeling | Eén observatieformulier | Drie verwante instrumenten (coach, docent-zelfreflectie, leerlingfeedback) die op elkaar **gemapt** worden |
| Planning | Niet aanwezig | Drag-and-drop dag-/uurplanning van coaches |

### 3.3 Wat nieuw is

Kwaliteitszorg & Planning-rol, opdrachtbeschrijving, traject-bouwer, planning-bord,
360°-mapping/vergelijking, leerplatform met opdrachten, modulevoortgang, publieke
formulieren met QR.

---

## 4. Terminologie (gedeelde taal voor dit PRD)

> Aansluitend op de begrippenlijst in `identiteit.md`. Gedeelde taal voorkomt dat
> "iedereen feedback zegt en iets anders bedoelt".

- **Coach** — onderwijskundige/adviseur van Het Leerinstituut die interventies en
  lesobservaties uitvoert bij scholen. In de huidige code heet deze rol nog
  `school_opleider`. **Voorstel: hernoemen naar `coach`** (zie [§5](#5-rolmodel-herzien) en
  [open beslissing B1](#11-open-beslissingen)).
- **Planner / Kwaliteitszorg** — nieuwe rol bij Het Leerinstituut die trajecten inricht,
  coaches inplant, briefings maakt en bewaakt of alles op schema loopt. Kan zelf ook als
  coach worden ingepland.
- **Opdrachtbeschrijving** — de afspraak met een school: wat gaan we doen, met welk doel,
  welke onderdelen, welk tijdpad, welke op te leveren rapportages. Vormt de basis van het traject.
- **Traject** — de geordende reeks momenten die een school doorloopt. Voorbeeld A:
  *nulmeting → basistraining → volgmeting*. Voorbeeld B: *basistraining → nulmeting →
  datatraining → volgmeting → verdiepingstraining → eindmeting → datatraining*. De
  samenstelling is vrij en uitbreidbaar.
- **Trajectstap** — één moment in het traject. Type: **meting** (nulmeting, volgmeting,
  eindmeting), **training** (basis-, data-, verdiepingstraining) of **maatwerk**. Een stap
  heeft een planning, betrokken coaches en eventueel een op te leveren rapportage.
- **Interventie** — de uitvoering door een coach op locatie (bv. een lesobservatie of
  trainingssessie) binnen een trajectstap.
- **Inzet / planning** — het toewijzen van coaches aan dagen (of uren) binnen een traject.
- **Beoordelingsinstrument** — een gestructureerd formulier. Drie verwante varianten:
  **coachbeoordeling**, **docent-zelfreflectie**, **leerlingfeedback**. Inhoudelijk
  nagenoeg gelijk, anders geformuleerd per doelgroep.
- **360°-beeld** — de drie perspectieven (coach, docent, leerling) naast elkaar op dezelfde
  onderliggende thema's, ter ondersteuning van het *gesprek* — niet als ranking.
- **Module / les** — leerinhoud binnen het leerplatform die een docent volgt en afrondt.
- **Modulevoortgang** — percentage afgeronde modules, op school- en (voor bevoegde rollen) docentniveau.
- **Publiek formulier** — formulier buiten de inlogmuur, bereikbaar via link of QR-code.

---

## 5. Rolmodel (herzien)

Zes "personas", waarvan vijf met login. Per rol: waar werken ze (Leerinstituut vs school),
wat doen ze, en waar starten ze (cockpit).

| Rol | Hoort bij | Kern | Mag wél | Mag niet |
| --- | --- | --- | --- | --- |
| **Admin / eigenaar** | Leerinstituut | Beheer + alles van planner | Scholen, gebruikers, rechten, templates beheren; batch-upload; alle trajecten | — |
| **Planner (Kwaliteitszorg & Planning)** | Leerinstituut | Trajecten inrichten en bewaken | Opdrachtbeschrijving, traject samenstellen, coaches plannen, briefen, communiceren met schoolleiding, evalueren; zelf als coach worden ingepland | Gebruikers/rechten/scholen aanmaken (dat is admin) |
| **Coach** (was schoolopleider) | Leerinstituut | Interventies & observaties | Eigen interventies uitvoeren, beoordelingen invullen/inzien; (optioneel) totaalbeeld inclusief andere coaches en docent-zelfreflecties | Beheer; planning inrichten |
| **Schoolleider** | School | Sturen op cultuur, geen afrekenen | Live data van **eigen** school, coach-overzicht, vrijgegeven rapportages, modulevoortgang (school + per docent) | Ruwe observatiedata per docent als ranglijst |
| **Docent** | School | Eigen ontwikkeling | Eigen zelfreflectie + beoordelingen op zichzelf inzien; lessen/modules volgen; opdrachten maken/inleveren; eigen voortgang | Data van collega's |
| **Publieke gebruiker** (leerling/docent, geen login) | School (context via link) | Formulier invullen | Eén formulier invullen via link/QR | Inloggen, data inzien |

> **Belangrijke identiteitskeuze.** De feedback noemt dat coaches "de algehele beoordeling
> dus ook van andere coaches" en "de zelfbeoordelingen van de geobserveerde docenten" mogen
> zien. Dat kan, maar gericht op *kalibratie en ontwikkeling*, niet op rangschikken. Voor de
> **schoolleider** blijft de regel uit `identiteit.md` hard: aggregaten, trends en acties —
> **geen** docent-ranglijst. Zie [§9](#9-identiteitstoets).

---

## 6. Kernconcepten en datamodel in begrijpelijke taal

Dit hoofdstuk legt de nieuwe bouwstenen uit zonder techniek. De technische vertaling staat
in [§10](#10-technische-impact-brug-naar-de-tdd).

### 6.1 Opdrachtbeschrijving → traject

Een traject begint bij een **opdrachtbeschrijving** die de planner samen met de school maakt.
Daarin staan: doel, scope, gekozen onderdelen, tijdpad en welke rapportages worden opgeleverd.
Uit de opdrachtbeschrijving rolt een **traject**: een rij **trajectstappen** in volgorde.

Een trajectstap is van een **type** (meting / training / maatwerk), heeft een **periode of
datum**, **betrokken coaches** en eventueel een **op te leveren rapportage**. Het samenstellen
moet simpel zijn: stappen kiezen uit een bibliotheek van standaardstappen, volgorde slepen,
en eenvoudig **een extra (maatwerk)stap toevoegen**.

### 6.2 Planning (inzet van coaches)

Binnen het traject worden coaches gepland. **Default-eenheid = een dag**; afwijkend geven we
**uren** op. Meerdere coaches kunnen op dezelfde dag worden gepland. De planner werkt op een
**drag-and-drop bord** (zoals het Lumio-sleepsysteem): coaches/kaarten naar dagen of stappen
slepen. Conflicten (coach niet beschikbaar, dubbele inzet) worden zichtbaar gemaakt.

Beschikbaarheid van coaches is een eigen gegeven (per coach: beschikbare dagen/uren), zodat de
planner alleen kan inplannen wat kan.

### 6.3 Beoordelingsinstrumenten en de 360°-mapping

Er zijn drie verwante instrumenten op **dezelfde onderliggende thema's** (bv. heldere
instructie, actieve betrokkenheid, afstemming op verschillen, controle van begrip):

- **coachbeoordeling** (coach observeert docent),
- **docent-zelfreflectie** (docent over zichzelf),
- **leerlingfeedback** (leerlingen over de les/docent).

Omdat de vragen "nagenoeg gelijk, alleen anders gesteld" zijn, leggen we een **mapping** vast:
welke vraag in elk instrument hoort bij welk thema. Daarmee kunnen we de drie perspectieven
**naast elkaar** tonen per thema — zoals eerder in Power BI gedaan. Dit voedt het gesprek
("waar zien coach, docent en leerling hetzelfde, waar verschillen ze?").

### 6.4 Rapportage & evaluatie

Rapportages horen bij trajectstappen (bv. een rapportage na de nulmeting). Ze worden door Het
Leerinstituut **vrijgegeven** aan de school; pas daarna ziet de schoolleider ze. De bestaande
rapportbuilder (samenvatting/KPI/trend/acties + PDF/PPTX) blijft de basis en wordt gekoppeld
aan traject en metingen. De planner evalueert aan het eind of doelen behaald zijn.

### 6.5 Leerplatform (modules, lessenreeksen & opdrachten)

Het leerplatform is een **volwaardige leeromgeving**, geen lichte tijdlijn. De opbouw:

- een **module** bevat een **lessenreeks** (meerdere lessen in volgorde);
- een **les** is opgebouwd uit **contentblokken**: **rijke tekst** met daarnaast/daartussen
  **afbeeldingen** en **video** (en later audio/bestanden), zodat leerinhoud volledig binnen
  het platform kan worden samengesteld en gevolgd;
- een les kan een **opdracht** bevatten die de docent maakt en inlevert.

Docenten volgen de lessen, ronden ze af en leveren opdrachten in. Het traject is voor de
docent zichtbaar als tijdlijn met tussentijdse rapportage. Voor de schoolleider levert dit
**modulevoortgang** op: percentage docenten dat de modules per les heeft afgerond, en optioneel
per docent.

> Dit blijft trouw aan "geen klassieke cursus-LMS" doordat de leerinhoud **in dienst staat van
> het traject en de leskwaliteit** (observeren, reflecteren, ontwikkelen), niet als losse
> cursuswinkel. De content-rijkdom (lessenreeks + rich media) is wél volwaardig.

### 6.6 Publieke formulieren

Een formulier (leerlingfeedback of zelfreflectie) kan **buiten de inlogmuur** worden
gepubliceerd, bereikbaar via een **link en QR-code**, gekoppeld aan een school/traject/stap.
Inzendingen landen in dezelfde 360°-data, mits goed gekoppeld.

---

## 7. Informatiearchitectuur / nieuwe schermen

Bovenop de bestaande routes (`/app/cockpit`, `/app/observations/new`, `/app/reports`,
`/app/admin`, …) komen onder andere:

- **Planner-cockpit** — trajecten op schema, openstaande briefings, planningsconflicten.
- **Opdrachtbeschrijving** — intake-/opdrachtformulier + gespreksnotulen.
- **Trajectbouwer** — stappen kiezen/slepen, maatwerk toevoegen, rapportages koppelen.
- **Planningsbord** — drag-and-drop dag-/uurplanning van coaches; beschikbaarheidsweergave.
- **360°-vergelijking** — coach vs docent vs leerling per thema.
- **Coach-werkomgeving** — eigen interventies, beoordelingen, (optioneel) totaalbeeld.
- **Docent-leeromgeving** — modules volgen, opdrachten inleveren, eigen zelfreflectie + ontvangen feedback.
- **Schoolleider-cockpit (uitgebreid)** — coach-overzichtskaart, live data per perspectief, modulevoortgang.
- **Beheer-upload** — batch-/multimodal import met downloadbare blanco template.
- **Publiek formulier** — losse, openbare route + QR-generator (beheer).

---

## 8. Functionele requirements (epics & user stories)

Per epic: doel, user stories (met rol), en acceptatiecriteria (AC). Prioriteit: **P0** = MVP,
**P1** = belangrijk, **P2** = later.

### E1 — Opdrachtbeschrijving & intake (P0)
- Als **planner** wil ik een opdrachtbeschrijving voor een school maken, zodat het traject
  daarop gebaseerd kan worden.
- Als **planner** wil ik gespreksnotulen van het eerste gesprek vastleggen bij de opdracht.
- AC: opdracht bevat doel, scope, gekozen onderdelen, tijdpad en op te leveren rapportages;
  is gekoppeld aan één school; kan in concept en definitief.

### E2 — Trajectbouwer (P0)
- Als **planner** wil ik trajectstappen kiezen uit een bibliotheek en in volgorde zetten.
- Als **planner** wil ik eenvoudig een extra/maatwerkstap toevoegen.
- Als **planner** wil ik per stap een op te leveren rapportage koppelen.
- AC: ondersteunt minimaal nulmeting, volgmeting, eindmeting, basistraining, datatraining,
  verdiepingstraining + maatwerk; volgorde vrij; stappen toevoegen/verwijderen zonder gedoe.

### E3 — Planning (drag-and-drop) (P0/P1)
- Als **planner** wil ik coaches op dagen (default) of uren inplannen binnen een traject.
- Als **planner** wil ik meerdere coaches op één dag kunnen plannen.
- Als **planner** wil ik coach-beschikbaarheid zien en conflicten gewaarschuwd krijgen.
- Als **schoolleider** wil ik in een overzicht/card zien welke coaches op mijn school zijn.
- AC: sleepinteractie met toetsenbord-/niet-drag-alternatief (toegankelijkheid); dag = default,
  uren optioneel; conflictsignalering; schoolleider ziet alleen eigen school.

### E4 — Beoordelingsinstrumenten & 360°-mapping (P0/P1)
- Als **Leerinstituut** wil ik drie instrumenten (coach, docent-zelfreflectie, leerlingfeedback)
  op dezelfde thema's mappen.
- Als **coach/planner** wil ik de drie perspectieven per thema naast elkaar zien.
- AC: gedeelde themataxonomie; mapping per vraag; vergelijkingsweergave toont overeenkomst/verschil
  in groeitaal, **geen** ranking; respecteert privacy (leerlingfeedback geaggregeerd).

### E5 — Coach-werkomgeving (P0)
- Als **coach** wil ik mijn ingeplande interventies/observaties zien en uitvoeren.
- Als **coach** wil ik mijn eigen beoordelingen inzien.
- Als **coach** wil ik (indien vrijgegeven) het totaalbeeld incl. andere coaches en
  docent-zelfreflecties zien, voor kalibratie.
- AC: bouwt voort op bestaand observatieformulier; totaalbeeld is opt-in/configureerbaar en
  ontwikkelgericht.

### E6 — Docent-leeromgeving (P0/P1)
- Als **docent** wil ik mijn eigen zelfreflectie en de beoordelingen op mij inzien.
- Als **docent** wil ik modules met een lessenreeks volgen binnen het platform.
- Als **docent** wil ik per les rijke content zien: rijke tekst met afbeeldingen en video.
- Als **docent** wil ik opdrachten maken en inleveren.
- AC: docent ziet alleen eigen data; les bestaat uit contentblokken (tekst/afbeelding/video);
  voortgang per les/module wordt bijgehouden; opdracht-status (open/ingeleverd/beoordeeld).

### E6b — Content-authoring leerplatform (P1)
- Als **Leerinstituut (admin/planner)** wil ik modules en lessenreeksen samenstellen.
- Als **auteur** wil ik per les contentblokken toevoegen: rijke tekst, afbeeldingen, video.
- Als **auteur** wil ik lessen ordenen en aan een module/traject koppelen.
- AC: blok-gebaseerde editor; media-upload (afbeelding/video); volgorde aanpasbaar;
  publiceren/concept; koppeling aan traject/module.

### E7 — Schoolleider-cockpit (uitgebreid) (P0/P1)
- Als **schoolleider** wil ik live data van mijn eigen school inzien.
- Als **schoolleider** wil ik onderscheid maken tussen docent-, coach- en leerlingperspectief.
- Als **schoolleider** wil ik vrijgegeven rapportages inzien.
- Als **schoolleider** wil ik zien welk percentage docenten modules per les heeft afgerond,
  en optioneel per docent.
- AC: alleen eigen tenant; geen docent-ranglijst; "live" = actuele data binnen rechten;
  rapportages alleen na vrijgave.

### E8 — Beheer & batch-upload (P0/P1)
- Als **admin** wil ik scholen/omgevingen, gebruikers en rechten aanmaken — simpel en in batches.
- Als **admin** wil ik gebruikers multimodaal uploaden: kopiëren/plakken, CSV en/of Excel.
- Als **admin** wil ik een blanco template kunnen downloaden en duidelijke upload-feedback krijgen.
- AC: alles wat de planner kan + beheer; import valideert rijen en toont fouten per rij;
  template downloadbaar; audit-log van wijzigingen.

### E9 — Leerplatform / traject in beeld (P1)
- Als **docent/school** wil ik het hele traject met de school in beeld hebben.
- Als **docent** wil ik tussentijds mijn rapportage zien en opdrachten maken/inleveren.
- AC: trajecttijdlijn met huidige/volgende stap; tussentijdse rapportage zichtbaar; opdracht-flow.

### E10 — Publieke formulieren + QR (P1/P2)
- Als **Leerinstituut/school** wil ik een formulier buiten de inlogmuur publiceren voor
  leerlingen/docenten (feedback of zelfreflectie).
- Als **Leerinstituut** wil ik dat formulier delen via een QR-code.
- AC: openbare route zonder login; gekoppeld aan school/traject/stap; spam-/misbruikbeperking;
  inzendingen voeden 360°-data; QR genereerbaar in beheer.

### E11 — Rapportage & evaluatie (P0/P1)
- Als **planner** wil ik bewaken of coaches en het traject op schema lopen.
- Als **Leerinstituut** wil ik rapportages vrijgeven aan de school.
- Als **planner** wil ik het traject aan het eind evalueren tegen de doelen.
- AC: voortgang per trajectstap; vrijgave-stap vóór schoolinzage; evaluatie gekoppeld aan opdrachtdoelen.

---

## 9. Identiteitstoets

Elke nieuwe functie is langs de checklist in `identiteit.md` gelegd:

- **Geen afrekentool.** De 360°-mapping en het coach-totaalbeeld zijn voor *kalibratie en
  dialoog*, met groeitaal. Schoolleiders krijgen **geen** docent-ranglijst — dit blijft hard.
- **Mens blijft eigenaar.** AI-concepten blijven bewerkbaar/goed te keuren; planning en
  evaluatie zijn mensbeslissingen.
- **Privacy & tenant-scheiding.** Cross-tenant coaches mogen alleen data zien van scholen
  waar ze zijn ingepland; publieke formulieren bevatten geen herleidbare schooldata zonder
  expliciete koppeling; leerlingfeedback wordt geaggregeerd getoond.
- **Toegankelijkheid.** Drag-and-drop planning krijgt een niet-drag/toetsenbord-alternatief;
  44px-raakdoelen; respect voor `prefers-reduced-motion`.

---

## 10. Technische impact (brug naar de TDD)

> Richting, geen eindontwerp. Bedoeld om de TDD te kunnen schrijven.

### 10.1 Nieuwe/aangepaste domeinentiteiten
Op basis van `src/lib/domain/types.ts`:

- **`Role`** — `school_opleider` → `coach`; toevoegen `planner` (kwaliteitszorg). (zie B1)
- **`Assignment` (opdrachtbeschrijving)** — `tenantId`, doel, scope, onderdelen, tijdpad,
  notulen, status, gekoppelde op te leveren rapportages.
- **`Trajectory` (traject)** — `tenantId`, `assignmentId`, lijst van stappen, status.
- **`TrajectoryStep` (trajectstap)** — type (`meting`/`training`/`maatwerk`), datum/periode,
  coachIds, optionele `reportId`, status.
- **`CoachAvailability`** — coach, beschikbare dagen/uren.
- **`Planning` / `Assignmentslot`** — koppeling coach ↔ dag/uur ↔ trajectstap.
- **`AssessmentInstrument`** — variant (`coach`/`zelfreflectie`/`leerling`), vragen, mapping
  naar gedeelde **`Theme`**-taxonomie.
- **`Theme`** — gedeelde thema's waarop de drie instrumenten worden gemapt.
- **`Module`** (bevat een lessenreeks) → **`Lesson`** (geordend) → **`ContentBlock`**
  (type `rich_text` / `image` / `video` / later `audio`/`file`) + **`ModuleProgress`** /
  **`LessonProgress`** (per docent) en **`CourseTask`**-inlevering (opdracht maken/inleveren).
  NB: naamgeving — gebruik **`CourseTask`** voor leeropdrachten, los van de
  **`Assignment`** (opdrachtbeschrijving van het traject), om verwarring te voorkomen.
  Mediabestanden (afbeelding/video) via storage (Supabase Storage), met `tenantId`-scope.
- **`PublicForm`** + **`PublicFormSubmission`** (zonder login, met token/QR).
- **`ReportRelease`** — vrijgave-status van een rapportage richting school.

### 10.2 Cross-tenant coaches
Vandaag heeft elke `User` één `tenantId` en filtert alles daarop (`access.ts`). Coaches en
planners horen bij het **instituut** maar werken bij **scholen**. Nodig:

- een koppeltabel **coach ↔ school(en)** via planning/inzet;
- access-helpers die bepalen welke schooldata een coach mag zien op basis van zijn inzet,
  in plaats van puur `user.tenantId`;
- behoud van de harde regel: schoolleider/docent blijven strikt binnen eigen tenant.

### 10.3 RBAC-uitbreiding
`permissions.ts` uitbreiden met o.a.: `view:planning`, `edit:planning`, `view:assignment`,
`edit:assignment`, `view:trajectory`, `edit:trajectory`, `view:360`, `view:module`,
`edit:module`, `submit:task`, `manage:publicforms`, `release:reports`. Matrix aanvullen voor
`coach`, `planner`, `admin`, `school_leider`, `docent`.

### 10.4 Persistentie
Het fundament is nu prototype-lokaal. Voor planning, trajecten en publieke inzendingen is
echte, gedeelde persistentie nodig (de repo bevat al een Supabase-laag — `src/lib/supabase/*`).
De TDD bepaalt het datamodel + RLS (row level security) per tenant en voor publieke forms.

### 10.5 Drag-and-drop & 360°
- Planningsbord: kies een toegankelijke dnd-aanpak met toetsenbord-fallback.
- 360°-vergelijking: hergebruik bestaande blocks (`TrendLine`, `BulletMetric`, `KpiCard`) op
  basis van de gedeelde themataxonomie.

---

## 11. Beslissingen

### Besloten (juni 2026)

- **B1 — "Schoolopleider" wordt "coach".** ✅ Besloten. De rol `school_opleider` wordt
  hernoemd naar `coach`. Impact: `types.ts`, `roles.ts`, `permissions.ts`, seed-data, copy.
- **B2 — Planner is een aparte rol.** ✅ Besloten. `planner` (Kwaliteitszorg & Planning) is
  een eigen rol; admin = planner + beheer.
- **B7 — Leerplatform is volwaardig (niet licht).** ✅ Besloten. Modules met lessenreeksen,
  lessen opgebouwd uit contentblokken (rijke tekst + afbeeldingen + video), opdrachten en
  voortgang. Inclusief content-authoring (zie E6b). Blijft trouw aan "geen losse cursus-LMS"
  doordat content in dienst staat van het traject/leskwaliteit.

### Nog open

- **B3 — Mogen coaches standaard elkaars beoordelingen + docent-zelfreflecties zien?**
  *Voorstel: configureerbaar per traject, default uit*, conform identiteit (kalibratie, geen ranking).
- **B4 — "Live data" voor schoolleider — hoe live?** Realtime of bij paginalaad-actueel?
  *Voorstel: actueel-bij-laden in MVP, realtime later.*
- **B5 — Leerlingfeedback privacy** — minimum aantal inzendingen voordat resultaten getoond
  worden (anti-herleidbaarheid)? *Voorstel: drempel instelbaar, default ≥5.*
- **B6 — Publieke formulieren** — alleen door Leerinstituut/admin te publiceren, of ook door
  schoolleider? *Voorstel: alleen Leerinstituut (admin/planner) in MVP.*

---

## 12. Voorgestelde fasering

- **Fase 1 (MVP) — Traject & planning kern**
  E1 opdrachtbeschrijving, E2 trajectbouwer, E3 planning (dag-niveau), E5 coach-werkomgeving,
  E8 batch-upload basis, B1/B2 rolwijziging. Doel: een traject inrichten, coaches plannen,
  observeren — end-to-end.
- **Fase 2 — Inzicht & 360°**
  E4 360°-mapping, E7 schoolleider-cockpit uitgebreid (live data, coach-card, modulevoortgang),
  E11 rapportage/vrijgave/evaluatie, E3 uren-planning.
- **Fase 3 — Leren & extern**
  E6 docent-leeromgeving (modules/lessenreeks volgen, opdrachten), E6b content-authoring
  (rich text + afbeeldingen + video), E9 leerplatform-tijdlijn, E10 publieke formulieren + QR.

---

## 13. Vervolg

1. B1, B2 en B7 zijn besloten ([§11](#11-beslissingen)). Resterende keuzes: B3–B6.
2. ✅ De **TDD** is uitgewerkt in [`docs/tdd/platform-tdd.md`](../tdd/platform-tdd.md):
   datamodel + Supabase-schema/RLS, RBAC-matrix, migraties, API/routes en het hernoemplan
   `school_opleider` → `coach`. B3–B6 zijn daar als defaults ingevuld.
3. Fase 1 opdelen in concrete tickets.
