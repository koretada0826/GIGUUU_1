// NOIR ÉCLAT — central content & asset config.
// Swap image files in /public/images using the same names to change assets.

export const IMAGES = {
  // real product photography (transparent cutout)
  ringRealBlueGold: "/images/ring-blue-gold-real.png?v=3",
  // placeholders (swap with real photos using the same names)
  ringSilverCutout: "/images/ring-silver-cutout.png",
  ringBlueGoldCutout: "/images/ring-blue-gold-cutout.png",
  ringSilverMacro: "/images/ring-silver-macro.png",
  ringBlueGoldMacro: "/images/ring-blue-gold-macro.png",
  bgGoldDust: "/images/bg-gold-dust.png",
  bgBlackMarble: "/images/bg-black-marble.png",
} as const;

export type SectionId =
  | "intro"
  | "hero"
  | "manifesto"
  | "piece"
  | "collection"
  | "macro"
  | "craft"
  | "viewing"
  | "cta";

export const NAV_SECTIONS: { id: SectionId; index: string; label: string }[] = [
  { id: "hero", index: "01", label: "Maison" },
  { id: "manifesto", index: "02", label: "Manifesto" },
  { id: "piece", index: "03", label: "Signature" },
  { id: "collection", index: "04", label: "Collection" },
  { id: "macro", index: "05", label: "Detail" },
  { id: "craft", index: "06", label: "Craft" },
  { id: "viewing", index: "07", label: "Viewing Room" },
  { id: "cta", index: "08", label: "Preview" },
];

export const COLLECTION = [
  {
    n: "I",
    name: "MIDNIGHT BLOOM",
    line: "A sapphire held in a bloom of gold.",
    image: IMAGES.ringRealBlueGold,
    tint: "#0B5F78",
  },
  {
    n: "II",
    name: "BLUE ORBIT",
    line: "Light circling a single, deep blue centre.",
    image: IMAGES.ringRealBlueGold,
    tint: "#063642",
  },
  {
    n: "III",
    name: "NOIR PETAL",
    line: "White brilliance folded into shadow.",
    image: IMAGES.ringSilverCutout,
    tint: "#1a1a1a",
  },
  {
    n: "IV",
    name: "SILENT HALO",
    line: "A ring of light that asks for nothing.",
    image: IMAGES.ringSilverMacro,
    tint: "#2a2a2a",
  },
] as const;

export const VIEWING_ROOM = [
  {
    name: "CELESTIAL CUT",
    meta: "White Gold · Diamond Halo",
    image: IMAGES.ringSilverCutout,
  },
  {
    name: "MIDNIGHT BLOOM",
    meta: "Rose Gold · Blue Sapphire",
    image: IMAGES.ringRealBlueGold,
  },
  {
    name: "SILENT HALO",
    meta: "Mirror Polish · Macro Study",
    image: IMAGES.ringSilverMacro,
  },
  {
    name: "BLUE ORBIT",
    meta: "Facet Study · Deep Teal",
    image: IMAGES.ringBlueGoldMacro,
  },
] as const;
