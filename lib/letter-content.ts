import {
  PAGE_SEPARATOR,
  type FontStyle,
  type ColorTheme,
  type FlowerType,
  type StampType,
  type Letter,
} from "@/lib/constants";

export type LetterMetadataStored = {
  flower_id?: string | null;
  stamp_id?: string | null;
  theme_id?: string | null;
  font_id?: string | null;
};

export type LetterContentStored = {
  pages?: string[];
  title?: string | null;
};

export function letterPages(letter: Letter): string[] {
  const raw = letter.content as LetterContentStored | null | undefined;
  if (raw?.pages?.length) return raw.pages;
  return letter.body.split(PAGE_SEPARATOR);
}

export function letterTitle(letter: Letter): string | null {
  const raw = letter.content as LetterContentStored | null | undefined;
  if (raw?.title != null && raw.title !== "") return raw.title;
  return letter.title;
}

/** Stamp ID for `/public` stamp assets (legacy rows → `stamp_type`). */
export function stampIdFromLetter(letter: Letter): StampType | null {
  const m = letter.metadata as LetterMetadataStored | null | undefined;
  const id = (m?.stamp_id as StampType | undefined) ?? letter.stamp_type;
  return id ?? null;
}

export function flowerIdFromLetter(letter: Letter): FlowerType | null {
  const m = letter.metadata as LetterMetadataStored | null | undefined;
  const id = (m?.flower_id as FlowerType | undefined) ?? letter.flower_type;
  return id ?? null;
}

export function themeFromLetter(letter: Letter): ColorTheme {
  const m = letter.metadata as LetterMetadataStored | null | undefined;
  const t = m?.theme_id as ColorTheme | undefined;
  return t ?? letter.color_theme;
}

export function fontFromLetter(letter: Letter): FontStyle {
  const m = letter.metadata as LetterMetadataStored | null | undefined;
  const f = m?.font_id as FontStyle | undefined;
  return f ?? letter.font_style;
}
