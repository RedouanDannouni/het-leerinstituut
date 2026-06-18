# Het Leerinstituut — platformfundament

Werkend Next.js/TypeScript-fundament voor een rustig B2B-platform waarmee Het Leerinstituut scholen begeleidt in de kernflow:

**inloggen → rol-cockpit → observeren → AI-concept bewerken/goedkeuren → rapporteren/exporteren**.

## Stack

- Next.js App Router + React + TypeScript
- CSS custom properties als design-tokenlaag voor latere branding
- Lokale demo-session en seed-data met tenant- en RBAC-selectors
- PDF-export via `jspdf`, PPTX-export via `pptxgenjs`
- Vitest unit tests en Playwright smoke/e2e tests

## Starten

```bash
npm install
npm run dev
```

Open daarna `http://localhost:3000`.

## Demo-gebruikers

De loginpagina laat je wisselen tussen:

- Sanne de Vries — Schoolopleider — OBS De Noordster
- Murat Kaya — Schoolleider — OBS De Noordster
- Eva Jansen — Docent — OBS De Noordster
- Nora Bakker — Admin — Het Leerinstituut
- Ilias El Amrani — Schoolopleider — KC Het Kompas
- Mila van Dijk — Docent — KC Het Kompas

Gebruik deze rollen om te controleren dat:

- elke rol een eigen cockpit heeft;
- schoolleiders alleen aggregaten, trends, acties en rapporten zien;
- ruwe observatiedata en docent-ranglijsten niet zichtbaar zijn voor schoolleiders;
- schooldata per tenant gefilterd wordt.

## Belangrijkste routes

- `/login` — demo-login
- `/invite/welkom-noord` — uitnodiging accepteren
- `/forgot-password` en `/reset-password` — toegang herstellen
- `/app/cockpit` — rol-cockpit
- `/app/observations/new` — kernscherm lesbezoek/observatieformulier
- `/app/reports` — rapportgenerator met PDF/PPTX-export
- `/app/admin` — scholen, gebruikers, templates en auditlog

## Testen

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

De Playwright e2e-test valideert de kernflow op desktop- en tabletviewport:

1. schoolopleider logt in;
2. vult observatiecriteria;
3. ziet autosave;
4. genereert en bewerkt AI-concept;
5. keurt de samenvatting goed;
6. opent de rapportbuilder;
7. exporteert PDF en PPTX;
8. schoolleider ziet aggregaten en geen ruwe observatiedata;
9. admin ziet beheer- en auditoppervlakken.

## Productkeuzes

- AI is in dit fundament een lokale deterministische conceptgenerator. Er gaat geen data naar externe AI-diensten.
- Persistentie is lokaal/prototypegericht, maar alle schoolgebonden objecten dragen een `tenantId` en UI-data loopt via centrale selectors.
- De design-tokenlaag maakt latere huisstijl/branding mogelijk zonder componenten om te bouwen.
