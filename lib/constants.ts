export const FONT_STYLES = ["dancing_script", "caveat", "sacramento"] as const;
export type FontStyle = (typeof FONT_STYLES)[number];

export const COLOR_THEMES = ["vintage", "rose", "midnight"] as const;
export type ColorTheme = (typeof COLOR_THEMES)[number];

export const STAMP_TYPES = [
  "cherry_blossom",
  "butterfly",
  "moon",
  "sparrow",
  "none",
] as const;
export type StampType = (typeof STAMP_TYPES)[number];

export const FLOWER_TYPES = [
  "tulip",
  "lavender",
  "rose",
  "daisy",
  "forget_me_not",
  "none",
] as const;
export type FlowerType = (typeof FLOWER_TYPES)[number];

export const STAMP_EMOJI: Record<StampType, string> = {
  cherry_blossom: "🌸",
  butterfly: "🦋",
  moon: "🌙",
  sparrow: "🐦",
  none: "",
};

export const FLOWER_EMOJI: Record<FlowerType, string> = {
  tulip: "🌷",
  lavender: "💜",
  rose: "🌹",
  daisy: "🌼",
  forget_me_not: "💙",
  none: "",
};

export const THEME_CONFIG: Record<
  ColorTheme,
  { paper: string; ink: string; line: string; margin: string; accent: string }
> = {
  vintage: {
    paper: "bg-[#fdf6e3]",
    ink: "text-[#3d2b1f]",
    line: "rgba(139,119,91,0.18)",
    margin: "rgba(180,90,90,0.2)",
    accent: "#b45a5a",
  },
  rose: {
    paper: "bg-[#fdf0f0]",
    ink: "text-[#5c2030]",
    line: "rgba(180,90,100,0.15)",
    margin: "rgba(180,90,90,0.25)",
    accent: "#c06070",
  },
  midnight: {
    paper: "bg-[#1a1a2e]",
    ink: "text-[#e8dcc8]",
    line: "rgba(232,220,200,0.1)",
    margin: "rgba(180,100,100,0.15)",
    accent: "#8888cc",
  },
};

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
