export const FONT_STYLES = ["dancing_script", "caveat", "sacramento"] as const;
export type FontStyle = (typeof FONT_STYLES)[number];

export const COLOR_THEMES = ["vintage", "rose", "midnight"] as const;
export type ColorTheme = (typeof COLOR_THEMES)[number];

export const STAMP_TYPES = [
  "valentine02_1",
  "valentine02_2",
  "valentine02_3",
  "valentine02_4",
  "valentine02_5",
  "valentine02_6",
  "valentine02_7",
  "valentine02_8",
  "valentine02_9",
  "valentine03_1",
  "valentine03_2",
  "valentine03_3",
  "valentine03_4",
  "valentine03_5",
  "valentine03_6",
  "valentine03_7",
  "valentine03_8",
] as const;
export type StampType = (typeof STAMP_TYPES)[number];

/** Max postage stamps on one letter (paper + envelope). */
export const MAX_STAMPS_PER_LETTER = 2;

export const FLOWER_TYPES = [
  "red_1", "red_2", "red_3", "red_4",
  "purple_1", "purple_2", "purple_3", "purple_4",
  "purple2_1", "purple2_2", "purple2_3", "purple2_4",
  "orange_1", "orange_2", "orange_3", "orange_4",
  "yellow_1", "yellow_2", "yellow_3",
  "white_1", "white_2", "white_3", "white_4",
  "hasegawa_1", "hasegawa_2", "hasegawa_3", "hasegawa_4",
  "bouquet_1", "bouquet_2", "bouquet_3", "bouquet_4", "bouquet_5",
  "bouquet_6", "bouquet_7", "bouquet_8", "bouquet_9", "bouquet_10",
  "rose_garden_1", "rose_garden_2", "rose_garden_3", "rose_garden_4",
  "rose_garden_5", "rose_garden_6", "rose_garden_7", "rose_garden_8",
  "rose_garden_9",
  "rose_garden2_1", "rose_garden2_2", "rose_garden2_3", "rose_garden2_4",
  "rose_garden2_5", "rose_garden2_6", "rose_garden2_7",
] as const;
export type FlowerType = (typeof FLOWER_TYPES)[number];

export const FLOWER_IMAGE: Record<FlowerType, string> = {
  red_1: "/flowers/red-1.png",
  red_2: "/flowers/red-2.png",
  red_3: "/flowers/red-3.png",
  red_4: "/flowers/red-4.png",
  purple_1: "/flowers/purple-1.png",
  purple_2: "/flowers/purple-2.png",
  purple_3: "/flowers/purple-3.png",
  purple_4: "/flowers/purple-4.png",
  purple2_1: "/flowers/purple2-1.png",
  purple2_2: "/flowers/purple2-2.png",
  purple2_3: "/flowers/purple2-3.png",
  purple2_4: "/flowers/purple2-4.png",
  orange_1: "/flowers/orange-1.png",
  orange_2: "/flowers/orange-2.png",
  orange_3: "/flowers/orange-3.png",
  orange_4: "/flowers/orange-4.png",
  yellow_1: "/flowers/yellow-1.png",
  yellow_2: "/flowers/yellow-2.png",
  yellow_3: "/flowers/yellow-3.png",
  white_1: "/flowers/white-1.png",
  white_2: "/flowers/white-2.png",
  white_3: "/flowers/white-3.png",
  white_4: "/flowers/white-4.png",
  hasegawa_1: "/flowers/hasegawa-1.png",
  hasegawa_2: "/flowers/hasegawa-2.png",
  hasegawa_3: "/flowers/hasegawa-3.png",
  hasegawa_4: "/flowers/hasegawa-4.png",
  bouquet_1: "/flowers/bouquet-1.png",
  bouquet_2: "/flowers/bouquet-2.png",
  bouquet_3: "/flowers/bouquet-3.png",
  bouquet_4: "/flowers/bouquet-4.png",
  bouquet_5: "/flowers/bouquet-5.png",
  bouquet_6: "/flowers/bouquet-6.png",
  bouquet_7: "/flowers/bouquet-7.png",
  bouquet_8: "/flowers/bouquet-8.png",
  bouquet_9: "/flowers/bouquet-9.png",
  bouquet_10: "/flowers/bouquet-10.png",
  rose_garden_1: "/flowers/rose-garden-1.png",
  rose_garden_2: "/flowers/rose-garden-2.png",
  rose_garden_3: "/flowers/rose-garden-3.png",
  rose_garden_4: "/flowers/rose-garden-4.png",
  rose_garden_5: "/flowers/rose-garden-5.png",
  rose_garden_6: "/flowers/rose-garden-6.png",
  rose_garden_7: "/flowers/rose-garden-7.png",
  rose_garden_8: "/flowers/rose-garden-8.png",
  rose_garden_9: "/flowers/rose-garden-9.png",
  rose_garden2_1: "/flowers/rose-garden2-1.png",
  rose_garden2_2: "/flowers/rose-garden2-2.png",
  rose_garden2_3: "/flowers/rose-garden2-3.png",
  rose_garden2_4: "/flowers/rose-garden2-4.png",
  rose_garden2_5: "/flowers/rose-garden2-5.png",
  rose_garden2_6: "/flowers/rose-garden2-6.png",
  rose_garden2_7: "/flowers/rose-garden2-7.png",
};

export type FlowerCategory =
  | "rose_garden"
  | "red"
  | "purple"
  | "orange"
  | "yellow"
  | "white"
  | "hasegawa"
  | "bouquet";

export const FLOWER_CATEGORIES: { label: string; color: string; types: FlowerType[] }[] = [
  {
    label: "Rose Garden",
    color: "#a83250",
    types: [
      "rose_garden_1",
      "rose_garden_2",
      "rose_garden_3",
      "rose_garden_4",
      "rose_garden_5",
      "rose_garden_6",
      "rose_garden_7",
      "rose_garden_8",
      "rose_garden_9",
      "rose_garden2_1",
      "rose_garden2_2",
      "rose_garden2_3",
      "rose_garden2_4",
      "rose_garden2_5",
      "rose_garden2_6",
      "rose_garden2_7",
    ],
  },
  { label: "Red", color: "#c44040", types: ["red_1", "red_2", "red_3", "red_4"] },
  { label: "Purple", color: "#8860c8", types: ["purple_1", "purple_2", "purple_3", "purple_4", "purple2_1", "purple2_2", "purple2_3", "purple2_4"] },
  { label: "Orange", color: "#d48030", types: ["orange_1", "orange_2", "orange_3", "orange_4"] },
  { label: "Yellow", color: "#c8a020", types: ["yellow_1", "yellow_2", "yellow_3"] },
  { label: "White", color: "#a0988a", types: ["white_1", "white_2", "white_3", "white_4"] },
  { label: "Hasegawa", color: "#6a7a5a", types: ["hasegawa_1", "hasegawa_2", "hasegawa_3", "hasegawa_4"] },
  {
    label: "Bouquet",
    color: "#b85a72",
    types: [
      "bouquet_1",
      "bouquet_2",
      "bouquet_3",
      "bouquet_4",
      "bouquet_5",
      "bouquet_6",
      "bouquet_7",
      "bouquet_8",
      "bouquet_9",
      "bouquet_10",
    ],
  },
];

export const STAMP_LABELS: Record<StampType, string> = {
  valentine02_1: "Be My Valentine 02 · 1",
  valentine02_2: "Be My Valentine 02 · 2",
  valentine02_3: "Be My Valentine 02 · 3",
  valentine02_4: "Be My Valentine 02 · 4",
  valentine02_5: "Be My Valentine 02 · 5",
  valentine02_6: "Be My Valentine 02 · 6",
  valentine02_7: "Be My Valentine 02 · 7",
  valentine02_8: "Be My Valentine 02 · 8",
  valentine02_9: "Be My Valentine 02 · 9",
  valentine03_1: "Be My Valentine 03 · 1",
  valentine03_2: "Be My Valentine 03 · 2",
  valentine03_3: "Be My Valentine 03 · 3",
  valentine03_4: "Be My Valentine 03 · 4",
  valentine03_5: "Be My Valentine 03 · 5",
  valentine03_6: "Be My Valentine 03 · 6",
  valentine03_7: "Be My Valentine 03 · 7",
  valentine03_8: "Be My Valentine 03 · 8",
};

/** Postage art — Heritage PNG library (`npm run import:valentine-stamps`). */
export const STAMP_ART_PATH: Record<StampType, string> = {
  valentine02_1: "/stamps/valentine02-1.png",
  valentine02_2: "/stamps/valentine02-2.png",
  valentine02_3: "/stamps/valentine02-3.png",
  valentine02_4: "/stamps/valentine02-4.png",
  valentine02_5: "/stamps/valentine02-5.png",
  valentine02_6: "/stamps/valentine02-6.png",
  valentine02_7: "/stamps/valentine02-7.png",
  valentine02_8: "/stamps/valentine02-8.png",
  valentine02_9: "/stamps/valentine02-9.png",
  valentine03_1: "/stamps/valentine03-1.png",
  valentine03_2: "/stamps/valentine03-2.png",
  valentine03_3: "/stamps/valentine03-3.png",
  valentine03_4: "/stamps/valentine03-4.png",
  valentine03_5: "/stamps/valentine03-5.png",
  valentine03_6: "/stamps/valentine03-6.png",
  valentine03_7: "/stamps/valentine03-7.png",
  valentine03_8: "/stamps/valentine03-8.png",
};

/**
 * Envelope mini-paper preview (vault cards, compose sidebar, read header):
 * caps how much title/body render so copy stays inside the clipped polygon
 * above the V-flap. Same limits app-wide.
 */
export const ENVELOPE_PREVIEW_BODY_MAX_CHARS = 82;
export const ENVELOPE_PREVIEW_TITLE_MAX_CHARS = 38;

export const THEME_CONFIG: Record<
  ColorTheme,
  {
    paper: string;
    paperHex: string;
    ink: string;
    inkHex: string;
    line: string;
    margin: string;
    accent: string;
    label: string;
  }
> = {
  vintage: {
    paper: "bg-[#fdf6e3]",
    paperHex: "#fdf6e3",
    ink: "text-[#3d2b1f]",
    inkHex: "#3d2b1f",
    line: "rgba(139,119,91,0.18)",
    margin: "rgba(180,80,80,0.2)",
    accent: "#b45a5a",
    label: "Parchment",
  },
  rose: {
    paper: "bg-[#fdf0f0]",
    paperHex: "#fdf0f0",
    ink: "text-[#5c2030]",
    inkHex: "#5c2030",
    line: "rgba(180,90,100,0.15)",
    margin: "rgba(180,80,80,0.25)",
    accent: "#c06070",
    label: "Rose Petal",
  },
  midnight: {
    paper: "bg-[#16213e]",
    paperHex: "#16213e",
    ink: "text-[#c8bca8]",
    inkHex: "#c8bca8",
    line: "rgba(200,180,150,0.09)",
    margin: "rgba(180,100,100,0.11)",
    accent: "#8888cc",
    label: "Midnight",
  },
};

export const FONT_META: Record<
  FontStyle,
  { family: string; label: string; style: string }
> = {
  dancing_script: {
    family: "'Dancing Script', cursive",
    label: "Dancing Script",
    style: "elegant",
  },
  caveat: {
    family: "'Caveat', cursive",
    label: "Caveat",
    style: "casual",
  },
  sacramento: {
    family: "'Sacramento', cursive",
    label: "Sacramento",
    style: "formal",
  },
};

export const PAGE_SEPARATOR = "\n\n---page---\n\n";

export interface Letter {
  id: string;
  created_at: string;
  delivered_at: string | null;
  author_id: string;
  /** Nullable until recipient claims a share-link letter */
  recipient_id: string | null;
  title: string | null;
  body: string;
  font_style: FontStyle;
  color_theme: ColorTheme;
  stamp_type: StampType | null;
  flower_type: FlowerType | null;
  is_draft: boolean;
  is_opened: boolean;
  opened_at: string | null;
  /** Hybrid storage */
  sender_id?: string | null;
  content?: unknown;
  metadata?: unknown;
  access_key_hash?: string | null;
  is_claimed?: boolean;
}
