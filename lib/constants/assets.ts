/**
 * Canonical IDs stored in letter metadata JSON (`stamp_id`, `flower_id`, …).
 * Paths resolve under `/public` (Compose / LetterView resolve paths — never embed SVG binary in DB).
 */

import type { FlowerType, StampType } from "@/lib/constants";

/** Postage art — Heritage PNG library (run `npm run import:valentine-stamps`). */
export const STAMP_ASSET_BY_ID: Record<StampType, string> = {
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

export function stampSrcFromId(id: string | null | undefined): string | null {
  if (!id) return null;
  const row = STAMP_ASSET_BY_ID as Record<string, string>;
  return row[id] ?? null;
}

/** Resolved postage path for a known stamp id (compose + envelope overlays). */
export function stampAssetPath(stamp: StampType): string {
  return STAMP_ASSET_BY_ID[stamp];
}

export function flowerSrcFromId(id: string | null | undefined): string | null {
  if (!id) return null;
  const row = FLOWER_ASSET_BY_ID as Record<string, string>;
  return row[id] ?? FLOWER_ASSET_BY_ID.red_1;
}
