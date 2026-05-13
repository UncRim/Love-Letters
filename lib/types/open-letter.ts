/** Shared envelope stub for `/open/[id]` (no DB imports — safe for client bundles). */
export type OpenEnvelopeDTO = {
  id: string;
  title: string | null;
  deliveredAt: string;
  requiresUnlock: boolean;
  /** Up to two postage stamp IDs (matches sealed letter metadata). */
  stampTypes: string[];
  flowerType: string | null;
};
