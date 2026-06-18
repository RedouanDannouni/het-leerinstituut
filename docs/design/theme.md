# Thema en design tokens

De volgende kleuren zijn door de opdrachtgever meegegeven als basis voor de volgende UI-iteratie.

## Palette

| Token | Hex | Gebruik |
| --- | --- | --- |
| `--brand-slate` | `#2f6274` | secundaire navigatie, cards/accent borders |
| `--brand-blue` | `#0e6a8c` | toegankelijke primaire acties en links |
| `--brand-ink` | `#142930` | hoofdtekst, donkere vlakken |
| `--brand-mint` | `#38c9a6` | hoofdaccent / productkleur |
| `--brand-yellow` | `#ffd000` | highlights, aandachtspunten, kleine accenten |
| `--brand-black` | `#000000` | contrast / iconen indien nodig |
| `--brand-white` | `#ffffff` | surfaces |
| `--brand-background` | `#ecfaff` | achtergrond |

## Toegankelijkheidskeuze

`#38c9a6` is de hoofdaccentkleur, maar als knopkleur met witte tekst is het contrast beperkt. Daarom gebruikt het huidige tokenmodel:

- `#0e6a8c` voor primaire knoppen/links;
- `#38c9a6` als accent en zachte highlight;
- `#0e6a8c` als focuskleur, omdat dit op lichte vlakken meer contrast geeft;
- `#142930` als primaire tekstkleur;
- `#ecfaff` als achtergrond.

Zo blijft de huisstijl zichtbaar zonder de WCAG-baseline direct te verzwakken.

## CSS-tokenmapping

De palette is opgenomen in `src/styles/globals.css` als primitive brand tokens. Componenten gebruiken semantische tokens zoals:

- `--color-background`
- `--color-surface`
- `--color-text`
- `--color-primary`
- `--color-accent`
- `--color-focus`

Bij een latere restyle hoeft vooral deze tokenlaag aangepast te worden.
