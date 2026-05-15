"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface GuestVaultPanelProps {
  guestSentCount: number;
  onCompose: () => void;
}

function PencilGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M11.4 1.6a1.4 1.4 0 0 1 2 0l1 1a1.4 1.4 0 0 1 0 2l-7.5 7.5-3 .8.8-3 7.5-7.3Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
        fill="rgba(245,233,212,0.15)"
      />
      <path
        d="m10 3 2.7 2.7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Vault empty state for users who have not signed in yet.
 */
export function GuestVaultPanel({
  guestSentCount,
  onCompose,
}: GuestVaultPanelProps) {
  return (
    <div className="mx-auto max-w-lg py-12 text-center sm:py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-5xl sm:text-6xl mb-5"
      >
        📜
      </motion.div>
      <h2
        className="text-[clamp(22px,4vw,28px)] mb-3 leading-tight"
        style={{
          fontFamily: "var(--font-love-ya), cursive",
          color: "#5d1a17",
        }}
      >
        Your vault is waiting
      </h2>
      <p
        className="text-[14px] leading-relaxed text-[#6b4a3a] font-[family-name:var(--font-dm-sans)] mb-6 text-left px-1"
      >
        The vault is where <strong className="font-medium text-[#5d1a17]">letters addressed to you</strong>{" "}
        land after someone shares their link. Until you create an account,
        nothing is stored here in the cloud—this page simply explains how it works.
      </p>

      <div
        className="rounded-xl border border-[rgba(120,75,35,0.2)] bg-[rgba(255,253,248,0.55)] px-4 py-4 text-left mb-8 shadow-[0_4px_18px_rgba(45,28,12,0.06)]"
      >
        <p
          className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7a5c4a] mb-2 font-[family-name:var(--font-dm-sans)]"
        >
          How archiving works
        </p>
        <ol className="list-decimal space-y-2.5 pl-4 text-[13px] leading-snug text-[#5c4438] font-[family-name:var(--font-dm-sans)]">
          <li>
            <strong className="font-medium">Compose &amp; seal</strong> — you choose stationery, seal with a secret key, and get a shareable link.
          </li>
          <li>
            <strong className="font-medium">Send the link</strong> — the recipient opens it and, if they choose, saves the letter to their vault.
          </li>
          <li>
            <strong className="font-medium">Sign up when you&apos;re ready</strong> — your device remembers letters you sent as a guest; after you sign in, they attach to your account automatically.
          </li>
        </ol>
      </div>

      {guestSentCount > 0 ? (
        <p className="text-[12px] text-[#7a5c4a] mb-4 font-[family-name:var(--font-dm-sans)]">
          You&apos;ve sealed{" "}
          <strong className="text-[#5d1a17]">
            {guestSentCount} letter{guestSentCount !== 1 ? "s" : ""}
          </strong>{" "}
          on this browser. Sign in to link them to your name in Inked.
        </p>
      ) : null}

      <button
        type="button"
        onClick={onCompose}
        className="vault-compose-btn mx-auto min-h-[48px] px-8 py-3 text-[16px]"
      >
        <span>Compose a letter</span>
        <PencilGlyph />
      </button>

      <p className="mt-8 text-[13px] text-[#8a7268] font-[family-name:var(--font-dm-sans)]">
        Already have an account?{" "}
        <Link
          href="/auth/login?redirect_to=/vault"
          className="font-medium text-[#5d1a17] underline decoration-[rgba(93,26,23,0.35)] underline-offset-4 hover:decoration-[rgba(93,26,23,0.55)]"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
