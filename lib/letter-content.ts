import {
  PAGE_SEPARATOR,
  STAMP_TYPES,
  MAX_STAMPS_PER_LETTER,
  type FontStyle,
  type ColorTheme,
  type FlowerType,
  type StampType,
  type Letter,
} from "@/lib/constants";

export type LetterMetadataStored = {
  flower_id?: string | null;
  stamp_id?: string | null;
  /** Up to `MAX_STAMPS_PER_LETTER` IDs; preferred when present. */
  stamp_ids?: string[] | null;
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

function isValidStampId(id: string): id is StampType {
  return (STAMP_TYPES as readonly string[]).includes(id);
}

/** Resolved stamps from metadata + DB column (e.g. `/open/[id]` stub before unlock). */
export function stampsFromMetadata(
  meta: LetterMetadataStored | null | undefined,
  fallbackStampType: string | null | undefined,
): StampType[] {
  const out: StampType[] = [];
  const push = (id: string | null | undefined) => {
    if (!id || !isValidStampId(id)) return;
    if (out.includes(id)) return;
    if (out.length >= MAX_STAMPS_PER_LETTER) return;
    out.push(id);
  };

  if (Array.isArray(meta?.stamp_ids)) {
    for (const x of meta.stamp_ids) push(typeof x === "string" ? x : null);
  }
  if (out.length === 0) push(meta?.stamp_id ?? null);
  if (out.length === 0) push(fallbackStampType ?? null);
  return out;
}

/** All stamp IDs on the letter (0–3), for paper and envelope. */
export function stampsFromLetter(letter: Letter): StampType[] {
  const m = letter.metadata as LetterMetadataStored | null | undefined;
  return stampsFromMetadata(m, letter.stamp_type ?? null);
}

/** First stamp ID (legacy helpers / single-stamp call sites). */
export function stampIdFromLetter(letter: Letter): StampType | null {
  return stampsFromLetter(letter)[0] ?? null;
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
