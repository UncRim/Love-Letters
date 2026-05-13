"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { EnvelopeView } from "@/components/EnvelopeView";
import { LetterView } from "@/components/LetterView";
import type { Letter } from "@/lib/constants";
import {
  STAMP_TYPES,
  MAX_STAMPS_PER_LETTER,
  type StampType,
  type FlowerType,
} from "@/lib/constants";
import {
  letterPages,
  fontFromLetter,
  themeFromLetter,
  stampsFromLetter,
  flowerIdFromLetter,
} from "@/lib/letter-content";
import type { OpenEnvelopeDTO } from "@/lib/types/open-letter";

interface OpenLetterClientProps {
  letterId: string;
  envelope: OpenEnvelopeDTO;
}

export default function OpenLetterClient({
  letterId,
  envelope,
}: OpenLetterClientProps) {
  const [secret, setSecret] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [letter, setLetter] = useState<Letter | null>(null);
  const [claimBusy, setClaimBusy] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [, startTransition] = useTransition();

  const formattedDate = new Date(envelope.deliveredAt).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short", year: "numeric" }
  );

  async function unlock() {
    setErr("");
    setBusy(true);
    try {
      const res = await fetch(`/api/letters/${letterId}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      const data = (await res.json()) as {
        letter?: Letter;
        error?: string;
      };
      if (!res.ok) {
        setErr(data.error ?? "Could not open letter.");
        return;
      }
      if (data.letter) setLetter(data.letter);
    } catch {
      setErr("Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function claim() {
    setClaimBusy(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        const next = `/auth/login?redirect_to=${encodeURIComponent(`/open/${letterId}`)}`;
        window.location.href = next;
        return;
      }
      const res = await fetch(`/api/letters/${letterId}/claim`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setErr(data.error ?? "Could not save to vault.");
        return;
      }
      setClaimed(true);
      startTransition(() => {
        window.location.href = "/vault";
      });
    } catch {
      setErr("Could not claim letter.");
    } finally {
      setClaimBusy(false);
    }
  }

  const envelopeStamps = envelope.stampTypes
    .filter((id): id is StampType =>
      (STAMP_TYPES as readonly string[]).includes(id),
    )
    .slice(0, MAX_STAMPS_PER_LETTER);
  const flower = envelope.flowerType as FlowerType | null;

  const unlockedStamps = letter ? stampsFromLetter(letter) : envelopeStamps;
  const unlockedFlower = letter ? flowerIdFromLetter(letter) : flower;

  const pages = letter ? letterPages(letter) : [];
  const fontStyle = letter ? fontFromLetter(letter) : "dancing_script";
  const colorTheme = letter ? themeFromLetter(letter) : "vintage";
  const deliveredAt =
    letter?.delivered_at ?? letter?.created_at ?? envelope.deliveredAt;

  const showClaim = Boolean(
    letter && !letter.recipient_id && !claimed
  );

  return (
    <main className="flex-1 desk-canvas vault-page relative min-h-full flex flex-col bg-[#f8f4ee]">
      <div
        className="vault-grain pointer-events-none absolute inset-0 opacity-[0.85]"
        aria-hidden
      />
      <div
        className="relative flex-1 py-10 px-4 flex flex-col items-center"
        style={{
          backgroundImage: `
            linear-gradient(rgba(230,215,185,0.35), rgba(230,215,185,0.35)),
            repeating-linear-gradient(
              transparent,
              transparent 27px,
              rgba(139,115,85,0.12) 28px
            )
          `,
          backgroundColor: "#E5D3B3",
        }}
      >
        <div className="max-w-lg w-full mb-6">
          <a href="/" className="desk-back-link text-[#0B0D0F]/75">
            ← Home
          </a>
        </div>

        <AnimatePresence mode="wait">
          {!letter ? (
            <motion.div
              key="locked"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.38 }}
              className="w-full max-w-md mx-auto flex flex-col items-center gap-6"
            >
              <div className="max-w-xs mx-auto">
                <EnvelopeView
                  title={envelope.title}
                  date={formattedDate}
                  stamps={unlockedStamps}
                  flower={unlockedFlower}
                  isOpened={false}
                />
              </div>

              <div className="w-full rounded-xl border border-[#6B1B1B]/25 bg-[#fdf6e3]/95 backdrop-blur-sm px-5 py-5 shadow-[0_8px_28px_rgba(11,13,15,0.12)]">
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[#0B0D0F]/55 mb-2 font-[family-name:var(--font-dm-sans)]">
                  Secret key
                </label>
                <input
                  type="password"
                  autoComplete="off"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter the Secret Key to unlatch this letter."
                  className="w-full rounded-lg border border-[#d4c4a8] bg-white px-3 py-2.5 text-[14px] text-[#0B0D0F] placeholder:text-stone-400/70 font-[family-name:var(--font-dm-sans)] focus:outline-none focus:ring-2 focus:ring-[#6B1B1B]/30"
                />
                {err ? (
                  <p className="mt-2 text-[12px] text-red-700 font-[family-name:var(--font-dm-sans)]">
                    {err}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => void unlock()}
                  disabled={busy || secret.length < 1}
                  className="mt-4 w-full rounded-lg py-2.5 text-[15px] font-medium text-[#f5e9d4] transition-opacity disabled:opacity-40 font-[family-name:var(--font-dm-sans)]"
                  style={{ background: "#6B1B1B" }}
                >
                  {busy ? "Opening\u2026" : "Unlatch letter"}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ opacity: 0, rotateX: -18, scale: 0.94 }}
              animate={{ opacity: 1, rotateX: 0, scale: 1 }}
              transition={{
                duration: 0.68,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full max-w-lg mx-auto perspective-[900px]"
            >
              <LetterView
                pages={pages}
                fontStyle={fontStyle}
                colorTheme={colorTheme}
                deliveredAt={deliveredAt}
                currentPage={currentPage}
                totalPages={Math.max(1, pages.length)}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  setAnimKey((k) => k + 1);
                }}
                animationKey={animKey}
                stamps={unlockedStamps}
                widePaper
                footerSlot={
                  showClaim ? (
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => void claim()}
                        disabled={claimBusy}
                        className="rounded-xl px-6 py-3 text-[15px] font-medium text-[#f5e9d4] shadow-md transition-opacity disabled:opacity-50 font-[family-name:var(--font-dm-sans)]"
                        style={{
                          background: "#6B1B1B",
                          boxShadow: "0 4px 14px rgba(107,27,27,0.35)",
                        }}
                      >
                        {claimBusy ? "Saving\u2026" : "Save to my Vault"}
                      </button>
                    </div>
                  ) : !showClaim && letter.recipient_id ? (
                    <p className="text-center text-[13px] text-[#5d4a38] font-[family-name:var(--font-caveat)]">
                      This letter lives in someone&apos;s vault.
                    </p>
                  ) : null
                }
              />

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
