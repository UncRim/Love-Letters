/** Shared envelope stub for `/open/[id]` (no DB imports — safe for client bundles). */
export type OpenEnvelopeDTO = {
  id: string;
  title: string | null;
  deliveredAt: string;
  requiresUnlock: boolean;
  stampType: string | null;
  flowerType: string | null;
};
