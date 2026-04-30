"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

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

  useEffect(() => {
    if (!open || !shareUrl) return;
    setPhase("animate");
    setCopied(false);
  }, [open, shareUrl]);

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
                {phase === "animate" ? "Off it goes…" : "Sent with love"}
              </h2>
              <p className="text-center text-[13px] text-[#5c4a38] font-[family-name:var(--font-dm-sans)] mb-5">
                {phase === "animate"
                  ? "Watch your letter slide home."
                  : "Share this link so they can unlock it with your secret key."}
              </p>

              {/* 3D mailbox send sequence */}
              {phase === "animate" ? (
                <div className="relative mx-auto mb-2 flex justify-center rounded-xl bg-[rgba(11,13,15,0.06)] overflow-hidden ring-1 ring-[rgba(120,75,35,0.15)]">
                  <MailboxSendExperience
                    key={shareUrl}
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
