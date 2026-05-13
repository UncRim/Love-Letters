"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { playStampSound } from "@/lib/playStampSound";

const MailboxSendExperience = dynamic(
  () =>
    import("./mailbox/MailboxSendExperience").then((m) => ({
      default: m.MailboxSendExperience,
    })),
  { ssr: false, loading: () => <div className="h-[248px] w-full" aria-hidden /> },
);

interface LetterSealSuccessModalProps {
  open: boolean;
  shareUrl: string | null;
  onContinueToVault: () => void;
}

type ModalPhase = "animate" | "share";

export function LetterSealSuccessModal({
  open,
  shareUrl,
  onContinueToVault,
}: LetterSealSuccessModalProps) {
  const [phase, setPhase] = useState<ModalPhase>("animate");
  const [copied, setCopied] = useState(false);
  const [inkSplash, setInkSplash] = useState(false);
  const letterEnteredRef = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open || !shareUrl) return;
    queueMicrotask(() => {
      setPhase("animate");
      setCopied(false);
      setInkSplash(false);
      letterEnteredRef.current = false;
    });
  }, [open, shareUrl]);

  function handleLetterEnteredMailbox() {
    if (letterEnteredRef.current) return;
    letterEnteredRef.current = true;
    if (!reduceMotion) {
      setInkSplash(true);
      window.setTimeout(() => setInkSplash(false), 720);
    }
    void playStampSound();
  }

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <AnimatePresence>
      {open && shareUrl ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="seal-success-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            background: "rgba(11, 13, 15, 0.42)",
            backdropFilter: "blur(6px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-[420px] rounded-2xl border border-[#c4a574]/55 shadow-[0_24px_48px_rgba(11,13,15,0.18)] overflow-hidden"
            style={{
              background:
                "linear-gradient(165deg, #fdf8ee 0%, #f0e4d4 48%, #e8d9c8 100%)",
            }}
          >
            <div className="absolute inset-0 opacity-[0.35] pointer-events-none paper-noise" />

            <div className="relative px-7 pt-8 pb-7">
              <h2
                id="seal-success-title"
                className="text-center font-[family-name:var(--font-caveat)] text-[26px] text-[#3d2818] mb-1"
              >
                {phase === "animate" ? "Off it goes…" : "Sealed in ink"}
              </h2>
              <p className="text-center text-[13px] text-[#5c4a38] font-[family-name:var(--font-dm-sans)] mb-5">
                {phase === "animate"
                  ? "Watch your letter slide home."
                  : "Share this link so they can unlock it with your secret key."}
              </p>

              {/* 3D mailbox send sequence */}
              {phase === "animate" ? (
                <div className="relative mx-auto mb-2 flex justify-center rounded-xl bg-[rgba(11,13,15,0.06)] overflow-visible ring-1 ring-[rgba(120,75,35,0.15)]">
                  <AnimatePresence>
                    {inkSplash ? (
                      <>
                        <motion.div
                          key="splash-a"
                          aria-hidden
                          className="pointer-events-none absolute left-[46%] top-[48%] z-20 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-multiply"
                          style={{
                            background:
                              "radial-gradient(circle at 38% 42%, rgba(12,18,32,0.72) 0%, rgba(28,36,52,0.35) 42%, transparent 68%)",
                          }}
                          initial={{ scale: 0.15, opacity: 0.92 }}
                          animate={{ scale: 1.65, opacity: 0 }}
                          transition={{
                            duration: reduceMotion ? 0.12 : 0.52,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />
                        <motion.div
                          key="splash-b"
                          aria-hidden
                          className="pointer-events-none absolute left-[54%] top-[52%] z-20 h-16 w-20 -translate-x-1/2 -translate-y-1/2 rounded-[42%] mix-blend-multiply"
                          style={{
                            background:
                              "radial-gradient(ellipse at 50% 48%, rgba(8,12,22,0.65) 0%, transparent 62%)",
                          }}
                          initial={{ scale: 0.2, opacity: 0.78, rotate: -8 }}
                          animate={{
                            scale: 1.35,
                            opacity: 0,
                            rotate: 4,
                          }}
                          transition={{
                            duration: reduceMotion ? 0.1 : 0.45,
                            delay: 0.02,
                            ease: [0.33, 1, 0.44, 1],
                          }}
                        />
                        <motion.div
                          key="splash-c"
                          aria-hidden
                          className="pointer-events-none absolute left-1/2 top-[44%] z-20 h-3 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-multiply bg-[rgba(15,22,34,0.5)]"
                          initial={{ scaleX: 0.2, opacity: 0.85 }}
                          animate={{ scaleX: 1.1, opacity: 0 }}
                          transition={{
                            duration: reduceMotion ? 0.08 : 0.32,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                        />
                      </>
                    ) : null}
                  </AnimatePresence>
                  <MailboxSendExperience
                    key={shareUrl}
                    onLetterEnteredMailbox={handleLetterEnteredMailbox}
                    onComplete={() => setPhase("share")}
                  />
                </div>
              ) : null}

              <AnimatePresence mode="wait">
                {phase === "share" ? (
                  <motion.div
                    key="share"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="space-y-4 mt-2"
                  >
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-[#5a4a3a] mb-2 font-[family-name:var(--font-dm-sans)]">
                        Shareable link
                      </p>
                      <div className="flex gap-2 rounded-xl border border-[#c4a574]/45 bg-[#fffdf8]/90 p-3">
                        <p className="flex-1 text-[11px] font-mono text-[#2a1f0f] break-all leading-snug">
                          {shareUrl}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void copyLink()}
                        className="mt-3 w-full rounded-lg border border-[#6B1B1B]/35 bg-[#6B1B1B]/9 py-2.5 text-[13px] font-medium text-[#6B1B1B] font-[family-name:var(--font-dm-sans)] hover:bg-[#6B1B1B]/14 transition-colors"
                      >
                        {copied ? "Copied" : "Copy link"}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={onContinueToVault}
                      className="w-full rounded-xl py-3 text-[15px] font-medium text-[#f5e9d4] font-[family-name:var(--font-dm-sans)] shadow-md"
                      style={{
                        background: "#6B1B1B",
                        boxShadow: "0 4px 14px rgba(107,27,27,0.35)",
                      }}
                    >
                      Continue to vault
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
