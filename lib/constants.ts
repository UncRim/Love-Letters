export const FONT_STYLES = ["dancing_script", "caveat", "sacramento"] as const;
export type FontStyle = (typeof FONT_STYLES)[number];

export const COLOR_THEMES = ["vintage", "rose", "midnight"] as const;
export type ColorTheme = (typeof COLOR_THEMES)[number];

export const STAMP_TYPES = [
  "cherry_blossom",
  "butterfly",
  "moon",
  "star",
  "dove",
  "letter",
  "rose",
  "sun",
] as const;
export type StampType = (typeof STAMP_TYPES)[number];

export const FLOWER_TYPES = [
  "red_1", "red_2", "red_3", "red_4",
  "purple_1", "purple_2", "purple_3", "purple_4",
  "purple2_1", "purple2_2", "purple2_3", "purple2_4",
  "orange_1", "orange_2", "orange_3", "orange_4",
  "yellow_1", "yellow_2", "yellow_3",
  "white_1", "white_2", "white_3", "white_4",
  "hasegawa_1", "hasegawa_2", "hasegawa_3", "hasegawa_4",
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
};

export type FlowerCategory = "red" | "purple" | "orange" | "yellow" | "white" | "hasegawa";

export const FLOWER_CATEGORIES: { label: string; color: string; types: FlowerType[] }[] = [
  { label: "Red", color: "#c44040", types: ["red_1", "red_2", "red_3", "red_4"] },
  { label: "Purple", color: "#8860c8", types: ["purple_1", "purple_2", "purple_3", "purple_4", "purple2_1", "purple2_2", "purple2_3", "purple2_4"] },
  { label: "Orange", color: "#d48030", types: ["orange_1", "orange_2", "orange_3", "orange_4"] },
  { label: "Yellow", color: "#c8a020", types: ["yellow_1", "yellow_2", "yellow_3"] },
  { label: "White", color: "#a0988a", types: ["white_1", "white_2", "white_3", "white_4"] },
  { label: "Hasegawa", color: "#6a7a5a", types: ["hasegawa_1", "hasegawa_2", "hasegawa_3", "hasegawa_4"] },
];

export const STAMP_EMOJI: Record<StampType, string> = {
  cherry_blossom: "🌸",
  butterfly: "🦋",
  moon: "🌙",
  star: "⭐",
  dove: "🕊️",
  letter: "💌",
  rose: "🌹",
  sun: "☀️",
};

export const STAMP_LABELS: Record<StampType, string> = {
  cherry_blossom: "Blossom",
  butterfly: "Butterfly",
  moon: "Moon",
  star: "Star",
  dove: "Dove",
  letter: "Letter",
  rose: "Rose",
  sun: "Sun",
};

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
  recipient_id: string;
  title: string | null;
  body: string;
  font_style: FontStyle;
  color_theme: ColorTheme;
  stamp_type: StampType | null;
  flower_type: FlowerType | null;
  is_draft: boolean;
  is_opened: boolean;
  opened_at: string | null;
}
