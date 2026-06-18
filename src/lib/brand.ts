// Centrale verwijzingen naar de huisstijl-assets in /public/brand.
// Lever je officiële SVG's aan? Zet dit op "svg" en gebruik dezelfde
// bestandsnamen (logo.svg, logo_wit.svg, icon.svg, ...).
export const BRAND_ASSET_EXT: "png" | "svg" = "svg";

const ext = BRAND_ASSET_EXT;

export const brandAssets = {
  logo: {
    color: `/brand/logo/logo.${ext}`,
    white: `/brand/logo/logo_wit.${ext}`,
    black: `/brand/logo/logo_zwart.${ext}`,
  },
  icon: {
    color: `/brand/icon/icon.${ext}`,
    white: `/brand/icon/icon_wit.${ext}`,
    black: `/brand/icon/icon_zwart.${ext}`,
  },
} as const;
