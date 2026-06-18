# Identiteit — Het Leerinstituut

> Dit is geen samenvatting van een boek of website, maar het **werkdocument** waarin
> staat wie Het Leerinstituut is en hoe die identiteit doorwerkt in dít platform:
> in de productkeuzes, de teksten, de toon en de huisstijl.
>
> Gebruik dit document als toetssteen. Wie een scherm, microcopy, e-mail, rapporttekst
> of AI-prompt schrijft, controleert hier of de keuze klopt bij wie we zijn. Twijfel je
> tussen twee opties? De optie die het meest recht doet aan **hoge en positieve
> verwachtingen** en het minst naar een afrekencultuur neigt, wint.

## Inhoud

1. [Waarom dit document bestaat](#1-waarom-dit-document-bestaat)
2. [Wie we zijn](#2-wie-we-zijn)
3. [Onze overtuigingen](#3-onze-overtuigingen)
4. [Wat dit betekent voor het product](#4-wat-dit-betekent-voor-het-product)
5. [Toon & taal](#5-toon--taal)
6. [Visuele identiteit](#6-visuele-identiteit)
7. [Wat we niet zijn](#7-wat-we-niet-zijn)
8. [Gedeelde taal (begrippenlijst)](#8-gedeelde-taal-begrippenlijst)
9. [Beslis-checklist](#9-beslis-checklist)
10. [Bronnen](#10-bronnen)

---

## 1. Waarom dit document bestaat

Een platform straalt altijd een houding uit — bedoeld of onbedoeld. Een keuze als
"laten we schoolleiders de scores per docent tonen" is technisch triviaal, maar zegt
iets over wat we geloven over leren en vertrouwen. Dit document maakt die houding
expliciet, zodat losse keuzes optellen tot één herkenbare identiteit in plaats van
toevallig samenraapsel.

Het richt zich op iedereen die iets aan het product toevoegt: ontwikkelaars,
ontwerpers, mensen die copy of rapporttemplates schrijven, en AI-assistenten die in
deze repository werken.

## 2. Wie we zijn

Het Leerinstituut helpt scholen om de kloof tussen **onderwijsonderzoek** en de
**dagelijkse onderwijspraktijk** te overbruggen. De missie: kansen en leerresultaten
van leerlingen in Nederland verbeteren.

Onze legitimiteit komt niet uit theorie alleen. Ervaren onderwijskundigen en adviseurs
voerden meer dan duizend lesbezoeken uit en hielpen leraren(teams) bij het ontwerpen
van hoogwaardig onderwijs. We werken **evidence-informed**: wetenschap, praktijkervaring
én de specifieke schoolcontext samen — geen van drieën los.

We ondersteunen niet de leerling rechtstreeks, maar de **professional**: de leraar, het
team en vooral de schoolleider als bouwer van een lerende cultuur. Dit platform is
daarvan het digitale gereedschap.

**In één zin:** wij maken hoge en positieve verwachtingen zichtbaar, bespreekbaar en
volhoudbaar in de dagelijkse praktijk van een school.

## 3. Onze overtuigingen

Deze overtuigingen zijn de "waarom" achter elke productkeuze. Ze zijn afgeleid van onze
visie en van het gedachtegoed in *Wat schoolleiders met hoge verwachtingen doen*
(Redwane Bouttaouane).

- **Alle leerlingen kunnen leren.** "Alle" betekent iedereen — anders is het geen
  inclusief onderwijs. Dit is het fundament; al het andere volgt hieruit.
- **Verwachtingen zijn geen slogan, maar gedrag.** Ze worden zichtbaar in taal,
  routines, structuren en besluiten. Een poster verandert niets; dagelijks handelen wel.
- **Van lesgeven naar leren.** De vraag is niet of de stof behandeld is, maar wat de
  leerling daadwerkelijk geleerd heeft.
- **Interne attributie.** Externe factoren bestaan, maar zijn geen excuus. De
  professionele vraag is steeds: *wat kunnen wij anders doen?*
- **Data dienen het leren, niet het afrekenen.** Cijfers worden pas betekenisvol in
  professionele dialoog. Ze onderbouwen keuzes; ze veroordelen geen mensen.
- **Samen kom je verder.** Onderwijsverbetering is geen solo-actie maar professioneel
  samenwerken met structuur, focus en psychologische veiligheid.
- **Gedeelde taal maakt samenwerking echt.** Zonder gezamenlijke definities ontstaat
  schijnbare overeenstemming: iedereen zegt "feedback" en bedoelt iets anders.
- **Groei boven oordeel.** We spreken in termen van proces, inspanning en vervolgstap,
  niet in vaste eigenschappen ("slim", "zwak", "deze klas kan dit niet").

## 4. Wat dit betekent voor het product

Hier vertalen we identiteit naar concreet, controleerbaar productgedrag. Elke regel
koppelt een overtuiging aan een keuze die al in de code zit of die we bewaken.

| Overtuiging | Productkeuze in dit platform |
| --- | --- |
| Data om te leren, niet om af te rekenen | Schoolleiders zien **alleen aggregaten, trends, acties en rapporten** — geen ruwe observatiedata en geen docent-ranglijsten (`canViewRawObservations` staat uit voor `school_leider`). |
| De professional blijft eigenaar | Het **AI-concept is nadrukkelijk een startpunt**: "controleer en bewerk voordat je dit vaststelt". De observator bewerkt en keurt goed; de AI vervangt geen oordeel. |
| Groei boven oordeel | Scores dragen **groeitaal**: *Startpunt → In ontwikkeling → Stevig zichtbaar → Voorbeeldpraktijk*, niet een kaal cijfer of "onvoldoende". |
| Focus op leren | Observatiecriteria gaan over **leren**: heldere instructie, actieve betrokkenheid, afstemming op verschillen, controle van begrip. |
| Gedeelde taal | Criteria, labels en rapportsecties gebruiken **dezelfde formuleringen** door het hele product, zodat teams hetzelfde bedoelen. |
| Vertrouwen & veiligheid | AI draait **lokaal en deterministisch**; er gaat geen schooldata naar externe AI-diensten. Alle schoolgebonden objecten dragen een `tenantId`, zodat data per school gescheiden blijft. |
| Verbeteren is een proces | De kernflow loopt van **observeren → AI-concept bewerken/goedkeuren → rapporteren**: diagnose, dialoog, vervolgstap — niet een eenmalig eindoordeel. |

Praktische ontwerpregel die hieruit volgt: **als een functie het makkelijk maakt om
mensen te vergelijken of af te rekenen, is dat een waarschuwingssignaal.** Maak in
plaats daarvan het *leren* zichtbaar en de *vervolgstap* concreet.

## 5. Toon & taal

We schrijven in het **Nederlands**, rustig, helder en professioneel. We zijn een
serieuze partner van schoolleiders, geen reclamebureau en geen edutainment.

Leidende principes:

- **Groeitaal, geen deficittaal.** Beschrijf wat iemand kan ontwikkelen, niet wat
  iemand "niet is".
- **Procesgericht, niet persoonsgericht.** "Je hebt een heldere opbouw gebruikt",
  niet "wat ben jij goed".
- **Concreet boven jargon.** Gebruik containerbegrippen alleen als ze in dit document
  gedefinieerd zijn (zie [begrippenlijst](#8-gedeelde-taal-begrippenlijst)).
- **Eigenaarschap respecteren.** Teksten *ondersteunen* de professional; ze nemen geen
  beslissingen over.

| Liever wel | Liever niet |
| --- | --- |
| "Ontwikkelkans: controle van begrip — maak de vervolgstap concreet." | "Onvoldoende op controle van begrip." |
| "Wat heeft deze leerling nodig?" | "Deze leerling kan dit niet." |
| "Het gemiddelde beeld is 3/4 (stevig zichtbaar)." | "Score: 3. Ranking: 4e van 6." |
| "Controleer en bewerk voordat je dit vaststelt." | "De AI heeft de samenvatting bepaald." |

## 6. Visuele identiteit

De huisstijl is rustig en hoogwaardig en versterkt vertrouwen — passend bij een
serieuze onderwijspartner.

- **Kleuren (merk):** petrol `#156188` (`--brand-petrol`), donker petrol `#0f4f6e` /
  `#0a3b53`, en mint `#34c2a3` (`--brand-mint`) als accent. Deze leven als
  design-tokens in `src/styles/globals.css`.
- **Tokenlaag eerst.** Gebruik bestaande CSS custom properties (kleur, ruimte, radius,
  schaduw) in plaats van hardgecodeerde waarden, zodat latere branding zonder
  ombouw kan.
- **Logo's en iconen** staan in `public/brand/` (zie `public/brand/README.md`):
  `logo_wit` op donkere vlakken, `logo` (kleur) op lichte achtergronden,
  `icon` als beeldmerk/favicon.
- **Toegankelijkheid is identiteit.** Inclusief onderwijs vraagt een inclusief product:
  voldoende contrast, zichtbare focus-states, raakdoelen van minimaal 44px en respect
  voor `prefers-reduced-motion`.

## 7. Wat we niet zijn

Grenzen maken identiteit scherp. Dit platform is **niet**:

- een **afreken- of monitoringtool** waarmee leidinggevenden individuele docenten
  ranken of beoordelen;
- een **surveillance-instrument**: observatie dient ontwikkeling, niet controle;
- een **black-box-AI** die oordelen velt; de mens blijft eigenaar en de AI is
  transparant en lokaal;
- **edutainment** of marketingtaal; we overdrijven niet en beloven geen wondermiddelen;
- een bron van **losse innovatieprojecten**; we ondersteunen consequent dagelijks
  gedrag boven spektakel.

## 8. Gedeelde taal (begrippenlijst)

Een team werkt pas effectief samen met een gemeenschappelijke taal. Dit zijn onze
gedeelde definities; gebruik ze consistent in product, copy en gesprekken.

- **Hoge en positieve verwachtingen** — de overtuiging, zichtbaar in gedrag, dat elke
  leerling én elke professional kan groeien.
- **Collective teacher efficacy** — het gedeelde geloof van een team dat hun handelen
  het verschil maakt voor leerresultaten.
- **Academisch optimisme** — vertrouwen in eigen invloed, in leerlingen en ouders, en
  een gerichtheid op leren.
- **Evidence-informed** — handelen op basis van wetenschap, praktijkervaring én de
  eigen schoolcontext samen.
- **Formatief evalueren** — tussentijds zicht krijgen op het leren om het onderwijs bij
  te sturen (i.t.t. summatief: een eindoordeel).
- **Interne attributie** — de oorzaak van resultaten primair zoeken in het eigen,
  beïnvloedbare handelen.
- **Professionele leergemeenschap (PLG)** — een team dat met structuur, focus en
  veiligheid samen werkt aan beter onderwijs.
- **Psychologische veiligheid** — een klimaat waarin twijfel, vragen en fouten mogen
  bestaan zonder oordeel.
- **Groeitaal** — taal gericht op proces, inspanning en vervolgstap in plaats van op
  vaste eigenschappen.

## 9. Beslis-checklist

Loop deze vragen langs bij een nieuwe feature, tekst of ontwerp:

1. Helpt dit een professional om **leren zichtbaar te maken** en een **vervolgstap**
   te zetten?
2. Maakt dit het per ongeluk makkelijker om mensen te **vergelijken of af te rekenen**?
   Zo ja: heroverweeg.
3. Blijft de **mens eigenaar** van het oordeel (en is de rol van AI/automatisering
   transparant)?
4. Gebruik ik **groeitaal** en **gedeelde begrippen** uit dit document?
5. Respecteert de keuze **privacy en tenant-scheiding**?
6. Is het **toegankelijk** voor iedereen?

Twijfel? Kies de variant die het dichtst bij "hoge en positieve verwachtingen" en het
verst van een afrekencultuur ligt.

## 10. Bronnen

- Website Het Leerinstituut — visie, aanpak, programma's en team:
  [hetleerinstituut.nl](https://www.hetleerinstituut.nl)
- Missie en achtergrond (kloof onderzoek–praktijk, 1000+ lesbezoeken).
- Redwane Bouttaouane, *Wat schoolleiders met hoge verwachtingen doen* — bron voor de
  overtuigingen in hoofdstuk 3 (collective teacher efficacy, academisch optimisme, van
  lesgeven naar leren, interne attributie, data als leerinstrument, gedeelde taal,
  voorbeeldgedrag en het beschermen van de leercultuur).
- Productimplementatie: `src/lib/domain/permissions.ts`,
  `src/lib/observations/scoring.ts`, `src/lib/observations/summary-generator.ts`,
  `src/lib/domain/seed-data.ts` en `src/styles/globals.css`.
