/**
 * Canonical IDs stored in letter metadata JSON (`stamp_id`, `flower_id`, …).
 * Paths resolve under `/public` (Compose / LetterView resolve paths — never embed SVG binary in DB).
 */

import type { FlowerType, StampType } from "@/lib/constants";

/** Landmark postage art — IDs align with legacy `StampType` strings. */
export const STAMP_ASSET_BY_ID: Record<StampType, string> = {
  cherry_blossom: "/stamps/eiffel.svg",
  butterfly: "/stamps/big-ben.svg",
  moon: "/stamps/liberty.svg",
  star: "/stamps/eiffel.svg",
  dove: "/stamps/big-ben.svg",
  letter: "/stamps/egypt.svg",
  rose: "/stamps/eiffel.svg",
  sun: "/stamps/egypt.svg",
};

/** Floral overlays — IDs align with legacy `FlowerType` strings. */
export const FLOWER_ASSET_BY_ID: Record<FlowerType, string> = {
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

export function stampSrcFromId(id: string | null | undefined): string | null {
  if (!id) return null;
  const row = STAMP_ASSET_BY_ID as Record<string, string>;
  return row[id] ?? null;
}

export function flowerSrcFromId(id: string | null | undefined): string | null {
  if (!id) return null;
  const row = FLOWER_ASSET_BY_ID as Record<string, string>;
  return row[id] ?? FLOWER_ASSET_BY_ID.red_1;
}
