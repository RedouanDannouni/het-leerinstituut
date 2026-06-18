# UI reference board

De gebruiker leverde vijf visuele referenties mee voor de volgende UI-iteratie. De originele afbeeldingen zijn in de chat meegestuurd, maar niet als afzonderlijke bestanden in de workspace beschikbaar gesteld. Dit document legt de relevante patronen vast zodat de redesign-instructie direct kan voortbouwen op dezelfde richting.

> Als de exacte afbeeldingen in de repository moeten worden opgeslagen, upload dan de originele bestanden als losse assets. Dan kunnen ze onder `docs/design/reference-images/` of `public/reference/` worden geplaatst.

## 1. Coursify — Course details

Belangrijke patronen:

- lichte app-shell met brede sidebar;
- zachte pastelaccenten;
- grote hero/card in het midden;
- rechterkolom met features en content;
- afgeronde cards met subtiele schaduw;
- rustige topbar met search en profiel;
- statuspill bij titel.

Vertaling naar Het Leerinstituut:

- observatie- of rapportdetail kan vergelijkbaar worden opgebouwd: inhoud links, context/acties rechts;
- statuslabels en metadata blijven dicht bij de titel;
- grote inhoudskaart voor formulier/rapportpreview.

## 2. Coursify — Course grid

Belangrijke patronen:

- dashboardgrid met cards;
- visuele samenvatting bovenaan;
- filtertabs onder KPI-gebied;
- product/cards met afbeelding, metadata en prijs/status;
- veel witruimte en zachte pastels.

Vertaling:

- projecten/materialen/rapporten kunnen sterker als card-grid worden vormgegeven;
- filters en status-tabs kunnen rustiger en visueler;
- schoolleidercockpit kan KPI/trend bovenaan houden en acties daaronder.

## 3. Quiz editor

Belangrijke patronen:

- editor met hoofdcontent links en settings-panel rechts;
- duidelijke toggles;
- secties in omlijnde panels;
- sticky/top action “Continue”;
- thumbnail/header boven content.

Vertaling:

- observatieformulier en rapportbuilder passen goed in een editor-layout;
- criteria/rapportblokken links, instellingen/samenvatting/acties rechts;
- toggles kunnen gebruikt worden voor rapportblokken, exportopties en notificaties.

## 4. Student details

Belangrijke patronen:

- profielkolom links;
- activity/performance cards rechts;
- grafieken in zachte kleuren;
- lijst met enrolled courses als rustige rows;
- quote/insight card als conversation starter.

Vertaling:

- docentcockpit kan een persoonlijkere detailpagina krijgen;
- schoolleidercockpit kan “gespreksonderwerp/insight” als aparte highlight card gebruiken;
- voortgangslijsten mogen card-rows worden in plaats van kale tabellen.

## 5. Sociafy — Analytics dashboard

Belangrijke patronen:

- afgeronde app-container met sterke whitespace;
- KPI-cards bovenaan;
- analytics-grid met grafieken;
- gradient/accent in actieve nav;
- export/share acties rechtsboven;
- zachte heatmap en donut/progress visuals.

Vertaling:

- rapporten en schoolleidercockpit kunnen een rijkere maar nog steeds kalme analytics-layout krijgen;
- exportacties horen prominent maar niet schreeuwerig rechtsboven;
- actieve navigatie kan een subtiele mint/teal highlight krijgen.

## Richting voor volgende UI-iteratie

Combineer:

- de Coursify-kalmte en pastel cards;
- de Sociafy-analytics structuur;
- de editor-layout uit de quiz-referentie;
- de rolgevoelige informatiearchitectuur uit de blueprint.

Belangrijk: dit platform blijft geen klassieke cursus-LMS. Gebruik de referenties voor stijl, ritme en componentkwaliteit, niet voor cursus-first productlogica.
