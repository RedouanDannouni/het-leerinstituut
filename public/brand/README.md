# Huisstijl-assets — Het Leerinstituut

Plaats hier de officiële logo's en iconen. De login en de app-shell verwijzen
automatisch naar deze bestanden. Vervang gerust de meegeleverde `.png`-fallbacks
door de officiële `.svg`-versies — gebruik dan exact dezelfde bestandsnamen, maar
met de extensie `.svg`, en zet `BRAND_ASSET_EXT` in `src/lib/brand.ts` op `"svg"`.

## Mapindeling

```
public/brand/
├── logo/                 # volledig woordmerk "Het Leerinstituut"
│   ├── logo.(svg|png)        # kleur  — voor lichte achtergronden
│   ├── logo_wit.(svg|png)    # wit    — voor donkere achtergronden
│   └── logo_zwart.(svg|png)  # zwart  — monochroom
└── icon/                 # beeldmerk (alleen het icoon)
    ├── icon.(svg|png)        # kleur
    ├── icon_wit.(svg|png)    # wit
    └── icon_zwart.(svg|png)  # zwart
```

## Waar worden ze gebruikt?

- `logo_wit` — op het donkere merkpaneel van de loginpagina.
- `logo` (kleur) — op lichte achtergronden, bv. boven het loginformulier op mobiel.
- `icon_wit` / `icon` — favicon en kleine merkmarkeringen.

> De `.png`-bestanden in deze mappen zijn voorlopige fallbacks. Lever je de
> `.svg`-varianten aan, dan blijven de bestandsnamen identiek en hoef je alleen
> de extensie in `src/lib/brand.ts` aan te passen.
