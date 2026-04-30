import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { LetterMetadataStored } from "@/lib/letter-content";
import type { OpenEnvelopeDTO } from "@/lib/types/open-letter";

/** Stub data for `/open/[id]` envelope — omits letter body until unlock (requires service role). */
export async function fetchOpenEnvelope(
  id: string
): Promise<OpenEnvelopeDTO | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("letters")
      .select(
        "id, title, delivered_at, created_at, metadata, stamp_type, flower_type, access_key_hash"
      )
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    if (!data.access_key_hash) return null;

    const meta = data.metadata as LetterMetadataStored | null | undefined;

    return {
      id: data.id,
      title: data.title,
      deliveredAt: data.delivered_at ?? data.created_at,
      requiresUnlock: true,
      stampType: meta?.stamp_id ?? data.stamp_type,
      flowerType: meta?.flower_id ?? data.flower_type,
    };
  } catch (e) {
    console.warn("fetchOpenEnvelope:", e);
    return null;
  }
}
