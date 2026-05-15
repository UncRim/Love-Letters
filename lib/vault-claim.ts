/**
 * Browser helpers for “Archive to my Vault” after auth redirects.
 */

export async function completeVaultClaimForLetter(
  letterId: string,
  secret: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/letters/${letterId}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Could not archive letter." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error." };
  }
}

export function storeClaimSecretForRedirect(letterId: string, secret: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem("inked-pending-claim-letter", letterId);
    window.sessionStorage.setItem(`inked-claim-secret:${letterId}`, secret);
  } catch {
    /* private mode */
  }
}

export function clearPendingClaimStorage(letterId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem("inked-pending-claim-letter");
    window.sessionStorage.removeItem(`inked-claim-secret:${letterId}`);
  } catch {
    /* noop */
  }
}

export function getPendingClaimFromStorage(): {
  letterId: string;
  secret: string;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const letterId = window.sessionStorage.getItem("inked-pending-claim-letter");
    if (!letterId) return null;
    const secret = window.sessionStorage.getItem(`inked-claim-secret:${letterId}`);
    if (!secret) return null;
    return { letterId, secret };
  } catch {
    return null;
  }
}

/** Run after sign-in when sessionStorage holds a letter + secret from the open-link flow. */
export async function flushPendingVaultClaim(): Promise<boolean> {
  const p = getPendingClaimFromStorage();
  if (!p) return false;
  const { ok } = await completeVaultClaimForLetter(p.letterId, p.secret);
  if (ok) clearPendingClaimStorage(p.letterId);
  return ok;
}
