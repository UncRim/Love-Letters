/**
 * Browser-only: letters sealed while logged out — IDs are synced to the
 * Supabase account after sign-up via POST /api/letters/sync-guest.
 */
export const GUEST_SENT_LETTER_IDS_KEY = "inked-guest-sent-letter-ids";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.filter((x): x is string => typeof x === "string" && UUID_RE.test(x));
  } catch {
    return [];
  }
}

export function readGuestSentLetterIds(): string[] {
  if (typeof window === "undefined") return [];
  return parseIds(window.localStorage.getItem(GUEST_SENT_LETTER_IDS_KEY));
}

export function appendGuestSentLetterId(id: string): void {
  if (typeof window === "undefined" || !UUID_RE.test(id)) return;
  const cur = readGuestSentLetterIds();
  if (cur.includes(id)) return;
  cur.push(id);
  try {
    window.localStorage.setItem(GUEST_SENT_LETTER_IDS_KEY, JSON.stringify(cur));
  } catch {
    /* quota */
  }
}

export function clearGuestSentLetterIds(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(GUEST_SENT_LETTER_IDS_KEY);
  } catch {
    /* noop */
  }
}

/** Remove IDs that were successfully linked to the signed-in account. */
export function removeGuestSentLetterIds(syncedIds: string[]): void {
  if (typeof window === "undefined" || syncedIds.length === 0) return;
  const drop = new Set(syncedIds);
  const next = readGuestSentLetterIds().filter((id) => !drop.has(id));
  try {
    if (next.length === 0) {
      window.localStorage.removeItem(GUEST_SENT_LETTER_IDS_KEY);
    } else {
      window.localStorage.setItem(
        GUEST_SENT_LETTER_IDS_KEY,
        JSON.stringify(next),
      );
    }
  } catch {
    /* quota */
  }
}

/**
 * After sign-in, attach guest-sealed letters (author unknown) to the session.
 * Call from the client when `getSession()` is present.
 */
export async function syncGuestLettersToAccount(): Promise<{
  ok: boolean;
  synced: number;
  error?: string;
}> {
  if (typeof window === "undefined") {
    return { ok: false, synced: 0, error: "Client only" };
  }
  const ids = readGuestSentLetterIds();
  if (ids.length === 0) return { ok: true, synced: 0 };
  try {
    const res = await fetch("/api/letters/sync-guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ letterIds: ids }),
    });
    const data = (await res.json()) as {
      synced?: number;
      ids?: string[];
      error?: string;
    };
    if (!res.ok) {
      return { ok: false, synced: 0, error: data.error ?? "Sync failed" };
    }
    const synced = data.ids ?? [];
    removeGuestSentLetterIds(synced);
    return { ok: true, synced: synced.length };
  } catch (e) {
    return {
      ok: false,
      synced: 0,
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}
