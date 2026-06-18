# Initiële productblueprint — Het Leerinstituut

Dit document bewaart de initiële productrichting in de repository, zodat de volgende UI-/productiteraties dezelfde context gebruiken.

## Wat we bouwen

Een modern, rustig en gebruiksvriendelijk B2B-platform waarmee Het Leerinstituut scholen begeleidt:

- projecten beheren;
- leskwaliteit observeren;
- rapporteren;
- met duidelijke output het gesprek met scholen voeren.

Het product is nadrukkelijk **geen klassieke cursus-LMS**. Het hart van het product is het **lesbezoek/observatieformulier** en de rapportage die daaruit volgt.

Drie uitgangspunten staan voorop:

1. Simpel voor elke gebruiker.
2. Modern en volwassen in uitstraling.
3. Vertrouwen geven dat de data klopt.

De interface moet kalm blijven: veel witruimte, duidelijke cards, heldere statuslabels en weinig decoratie.

## Belangrijke uitgangspunten

### Rol-gestuurde cockpits

Elke rol start op een eigen overzicht dat past bij de beslissing die die rol neemt. Er is geen generiek dashboard voor iedereen.

Rollen:

- **Schoolopleider** — openstaande observaties, concept-formulieren, projecten en recente rapporten.
- **Schoolleider** — voortgang, trends, aanbevolen acties/gespreksonderwerpen en rapporten downloaden. Bewust **geen** ruwe observatiedata en **geen** ranglijst van docenten.
- **Docent** — eigen lesmateriaal, ontwikkelgerichte feedback, afspraken en eigen voortgang.
- **Admin** — scholen/omgevingen, gebruikers & rechten, templates en systeemstatus.

### Multi-tenant data-isolatie

Scholen zijn aparte omgevingen binnen het instituut. Een gebruiker ziet nooit data van een andere school, tenzij de rol daarvoor expliciet rechten heeft.

Implementatie-afspraak:

- alle schoolgebonden data draagt een `tenantId`;
- UI-data loopt via centrale selectors/access helpers;
- rol- en tenantlogica wordt niet ad hoc in componenten verspreid.

### Branding via design tokens

Branding komt later, maar de structuur moet nu klaarstaan. Kleuren worden als tokens vastgelegd zodat de huisstijl in één laag kan worden aangepast.

### Toegankelijk en responsive

De applicatie moet bruikbaar zijn op laptop en tablet. Observaties gebeuren vaak op tablet, dus touch targets en eenvoudige single-column flows zijn belangrijk.

Baseline:

- WCAG-minded semantiek;
- zichtbare focus;
- labels voor inputs;
- statusupdates waar relevant met `aria-live`;
- geen kleur-alleen statuscommunicatie;
- niet-drag alternatieven voor upload/reorder.

### AI als hulp, niet als beslisser

AI-output is altijd:

- gelabeld als concept;
- bewerkbaar;
- traceerbaar naar de gebruiker die goedkeurt;
- pas bruikbaar in rapportage na expliciete menselijke goedkeuring.

## Te bouwen schermen

### Inloggen & toegang

- login;
- uitnodiging accepteren;
- wachtwoord vergeten;
- wachtwoord herstellen.

### Onboarding

Korte, overslaanbare eerste stap per rol, gericht op de eerste zinvolle actie.

### Cockpit / dashboard per rol

Vier varianten zoals hierboven beschreven.

### Projecten

Overzicht en detail met status, betrokkenen, gekoppeld materiaal en observaties.

### Lessen / lesmateriaal

Content bekijken en aanmaken: tekst, video, audio en bestanden.

### Lesbezoek / observatieformulier

Het kernscherm:

- context vooraf ingevuld;
- criteria als kaarten met score en toelichting;
- bewijs toevoegen via foto/bestand/notitie;
- autosave met concept-herstel;
- AI-conceptsamenvatting die de observator bewerkt en goedkeurt.

### Rapporten

Rapportgenerator op basis van templates:

- blokken zoals samenvatting, KPI's, trend en acties;
- live preview;
- narratief bewerken;
- export naar PDF en PPTX.

### Beheer

Adminfuncties:

- scholen/omgevingen aanmaken;
- gebruikers uitnodigen;
- rollen/rechten toekennen;
- formulier- en rapporttemplates beheren;
- exports/wijzigingen terugzien via auditlog.

### Instellingen & profiel

Persoonlijke instellingen, notificaties en organisatie-/omgevingsinstellingen afhankelijk van rechten.

## Eerste resultaat

Een werkend fundament met:

- login;
- vier rol-cockpits;
- observatieformulier;
- eerste rapport-export;
- een end-to-end demo van observeren → samenvatten → rapporteren → bespreken.

## Afwijkingen in het huidige fundament

- AI is lokaal/deterministisch geïmplementeerd voor de demo, zonder externe AI-service.
- Persistentie is prototype-local, maar tenant/RBAC-structuur is al aangebracht.
- Rapportexport is functioneel voor de eerste demo en kan later merk-/template-harder worden gemaakt.
