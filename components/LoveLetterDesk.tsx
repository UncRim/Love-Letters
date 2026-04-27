"use client";

import { useState, useRef, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { EnvelopeView } from "./EnvelopeView";
import { LetterView } from "./LetterView";
import { FlowerIcon } from "./FlowerIcon";
import { StampPicker } from "./ui/StampPicker";
import { FlowerPicker } from "./ui/FlowerPicker";
import { createClient } from "@/lib/supabase/client";
import { FONT_CLASSNAMES } from "@/lib/fonts";
import {
  THEME_CONFIG,
  FONT_META,
  PAGE_SEPARATOR,
  STAMP_EMOJI,
  type Letter,
  type FontStyle,
  type ColorTheme,
  type StampType,
  type FlowerType,
} from "@/lib/constants";

type View = "vault" | "compose" | "reading";

interface LoveLetterDeskProps {
  initialLetters: Letter[];
  userId: string;
}

// Some live databases were created with an outdated CHECK constraint
// that rejects newer (or even some older) flower variants. We don't
// know exactly which subset is allowed, so when an insert fails on the
// flower constraint we walk down a chain of progressively safer values
// until one is accepted. The final candidate is `null`, which is always
// allowed because the column is nullable.
const LEGACY_FLOWER_FALLBACK: Partial<Record<FlowerType, FlowerType>> = {
  purple2_1: "purple_1",
  purple2_2: "purple_2",
  purple2_3: "purple_3",
  purple2_4: "purple_4",
  hasegawa_1: "white_1",
  hasegawa_2: "white_2",
  hasegawa_3: "white_3",
  hasegawa_4: "white_4",
};

function flowerFallbackChain(
  picked: FlowerType | null,
): (FlowerType | null)[] {
  if (!picked) return [null];
  const chain: (FlowerType | null)[] = [picked];
  const legacy = LEGACY_FLOWER_FALLBACK[picked];
  if (legacy && legacy !== picked) chain.push(legacy);
  // `red_1` is the most likely value to exist in any historical version
  // of the constraint. Last-ditch: null (column is nullable).
  if (picked !== "red_1" && (!legacy || legacy !== "red_1"))
    chain.push("red_1");
  chain.push(null);
  return chain;
}

function isCheckConstraintError(
  err: { message?: string | null; details?: string | null; code?: string | null } | null,
  constraintName: string,
) {
  if (!err) return false;
  const haystack = `${err.message ?? ""} ${err.details ?? ""}`.toLowerCase();
  return (
    err.code === "23514" ||
    haystack.includes(constraintName.toLowerCase()) ||
    haystack.includes("check constraint")
  );
}

export function LoveLetterDesk({
  initialLetters,
  userId,
}: LoveLetterDeskProps) {
  const router = useRouter();
  const [view, setView] = useState<View>("vault");
  const [letters, setLetters] = useState(initialLetters);
  const [activeLetter, setActiveLetter] = useState<Letter | null>(null);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Reading state
  const [readPage, setReadPage] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  // Compose state
  const [title, setTitle] = useState("");
  const [pages, setPages] = useState<string[]>([""]);
  const [curPage, setCurPage] = useState(0);
  const [fontStyle, setFontStyle] = useState<FontStyle>("dancing_script");
  const [colorTheme, setColorTheme] = useState<ColorTheme>("vintage");
  const [stampType, setStampType] = useState<StampType>("cherry_blossom");
  const [flowerType, setFlowerType] = useState<FlowerType>("red_1");
  const [recipientId, setRecipientId] = useState(userId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const taRef = useRef<HTMLTextAreaElement>(null);

  const resetComposer = useCallback(() => {
    setTitle("");
    setPages([""]);
    setCurPage(0);
    setFontStyle("dancing_script");
    setColorTheme("vintage");
    setStampType("cherry_blossom");
    setFlowerType("red_1");
    setRecipientId(userId);
    setSaving(false);
    setSaved(false);
    setErrorMsg("");
  }, [userId]);

  // ── Vault actions ──

  function openLetter(letter: Letter) {
    setActiveLetter(letter);
    setEnvelopeOpened(letter.is_opened);
    setReadPage(0);
    setView("reading");
  }

  async function handleOpenEnvelope() {
    if (!activeLetter) return;
    const supabase = createClient();
    await supabase
      .from("letters")
      .update({ is_opened: true, opened_at: new Date().toISOString() })
      .eq("id", activeLetter.id);

    setEnvelopeOpened(true);
    setLetters((prev) =>
      prev.map((l) =>
        l.id === activeLetter.id ? { ...l, is_opened: true } : l
      )
    );
    setTimeout(() => setAnimKey((k) => k + 1), 950);
  }

  function goToVault() {
    setView("vault");
    setActiveLetter(null);
    setEnvelopeOpened(false);
    startTransition(() => router.refresh());
  }

  function goToCompose() {
    resetComposer();
    setView("compose");
  }

  // ── Compose actions ──

  const handleBodyChange = useCallback(
    (value: string) => {
      setPages((prev) => {
        const next = [...prev];
        next[curPage] = value;
        return next;
      });
    },
    [curPage]
  );

  const changePage = (dir: -1 | 1) => {
    const nextPage = curPage + dir;
    if (nextPage < 0) return;
    if (nextPage >= pages.length) {
      setPages((prev) => [...prev, ""]);
    }
    setCurPage(nextPage);
    setTimeout(() => taRef.current?.focus(), 50);
  };

  async function handleSeal() {
    if (!title.trim() || pages.every((p) => !p.trim())) return;
    setErrorMsg("");
    setSaving(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg("You must be signed in.");
        setSaving(false);
        return;
      }

      // recipient_id must be a UUID referencing auth.users.
      // Fall back to self when the field is empty or not a valid UUID.
      const uuidRe =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const trimmedRecipient = (recipientId ?? "").trim();
      const finalRecipient =
        trimmedRecipient && uuidRe.test(trimmedRecipient)
          ? trimmedRecipient
          : user.id;

      const payload = {
        author_id: user.id,
        recipient_id: finalRecipient,
        title: title.trim(),
        body: pages.join(PAGE_SEPARATOR),
        font_style: fontStyle,
        color_theme: colorTheme,
        stamp_type: stampType,
        flower_type: flowerType,
        delivered_at: new Date().toISOString(),
        is_draft: false,
      };

      // Walk a fallback chain so the insert succeeds even when the
      // live DB has a stale `letters_flower_type_check` (or stamp
      // constraint). Each iteration retries with progressively safer
      // values; the final attempt sends `null` for the offending field,
      // which is always accepted because both columns are nullable.
      const flowerChain = flowerFallbackChain(flowerType);
      const stampChain: (StampType | null)[] = stampType
        ? [stampType, null]
        : [null];

      let data:
        | (Letter & Record<string, unknown>)
        | Record<string, unknown>
        | null = null;
      let error: {
        code?: string | null;
        message?: string | null;
        details?: string | null;
        hint?: string | null;
      } | null = null;
      let savedFlower: FlowerType | null = flowerType;
      let savedStamp: StampType | null = stampType;

      for (const flowerCandidate of flowerChain) {
        for (const stampCandidate of stampChain) {
          const attempt = await supabase
            .from("letters")
            .insert({
              ...payload,
              flower_type: flowerCandidate,
              stamp_type: stampCandidate,
            })
            .select()
            .single();

          data = attempt.data;
          error = attempt.error;
          savedFlower = flowerCandidate;
          savedStamp = stampCandidate;

          if (!error) break;

          const flowerRejected = isCheckConstraintError(
            error,
            "letters_flower_type_check",
          );
          const stampRejected = isCheckConstraintError(
            error,
            "letters_stamp_type_check",
          );

          if (!flowerRejected && !stampRejected) {
            // Different error — stop retrying and surface it.
            break;
          }
          if (flowerRejected) {
            // Need to advance the flower chain — break the inner loop.
            break;
          }
          // Otherwise stamp was rejected; continue the inner loop to
          // try the next stamp candidate (i.e. null).
        }

        if (!error) break;

        // Stop if the only remaining errors aren't the flower constraint.
        if (!isCheckConstraintError(error, "letters_flower_type_check")) {
          break;
        }
      }

      if (!error && (savedFlower !== flowerType || savedStamp !== stampType)) {
        console.warn(
          "Letter saved with fallback values because the live DB CHECK " +
            "constraints rejected the originals. Apply the migration at " +
            "supabase/migrations/20260427_update_flower_type_check.sql " +
            "(or the SQL printed in the README) to allow every variant.",
          {
            picked: { flower_type: flowerType, stamp_type: stampType },
            saved: { flower_type: savedFlower, stamp_type: savedStamp },
          },
        );
      }

      if (error) {
        // Supabase / PostgREST errors are objects with non-enumerable
        // properties — log each piece explicitly so it isn't shown as `{}`.
        console.error("Failed to seal letter", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          payload,
        });
        const friendly =
          error.code === "42501" ||
          /row[- ]level security|RLS|policy/i.test(error.message ?? "")
            ? "Permission denied — check your sign-in or recipient ID."
            : error.message || "Failed to send. Please try again.";
        setErrorMsg(friendly);
        return;
      }

      setSaved(true);

      if (data && finalRecipient === userId) {
        setLetters((prev) => [data as Letter, ...prev]);
      }

      setTimeout(() => goToVault(), 1800);
    } catch (err) {
      const e = err as { message?: string };
      console.error("Failed to seal letter (exception)", {
        message: e?.message,
        raw: err,
      });
      setErrorMsg(e?.message || "Failed to send. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Derived compose values ──

  const inkColor = THEME_CONFIG[colorTheme].inkHex;
  const paperBg = THEME_CONFIG[colorTheme].paperHex;
  const lineColor = THEME_CONFIG[colorTheme].line;
  const marginColor = THEME_CONFIG[colorTheme].margin;
  const fontFamily = FONT_META[fontStyle].family;
  const pageContent = pages[curPage] ?? "";

  // ── Split letter body into pages for reading ──

  const readPages = activeLetter?.body.split(PAGE_SEPARATOR) ?? [];

  // ── Vault grouping (most recent first) ──
  // Letters are ordered by delivery date when present (so scheduled letters
  // sort by when they were *meant* to arrive), otherwise by creation date.
  const sortByDateDesc = (a: Letter, b: Letter) =>
    new Date(b.delivered_at || b.created_at).getTime() -
    new Date(a.delivered_at || a.created_at).getTime();

  const sealedLetters = letters
    .filter((l) => !l.is_opened)
    .slice()
    .sort(sortByDateDesc);
  const unsealedLetters = letters
    .filter((l) => l.is_opened)
    .slice()
    .sort(sortByDateDesc);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });

  return (
    <div className="flex-1 flex flex-col">
      {/* Header — hidden on the vault view, where the notebook page hosts its own header */}
      {view !== "vault" && (
        <header className="px-6 py-5 border-b border-stone-200/60 flex items-center justify-between bg-[#f8f4ee]/80 backdrop-blur-sm sticky top-0 z-40">
          <button onClick={goToVault} className="text-left group">
            <h1 className="text-xl font-[family-name:--font-playfair] italic text-stone-800 tracking-tight group-hover:text-stone-600 transition-colors">
              Love Letters
            </h1>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {letters.length} letter{letters.length !== 1 ? "s" : ""} sealed
            </p>
          </button>

          {view !== "compose" && (
            <button
              onClick={goToCompose}
              className="px-5 py-2.5 rounded-lg text-white text-[13px] font-[family-name:--font-playfair] italic tracking-wide hover:opacity-90 transition shadow-sm"
              style={{ background: "#b83030" }}
            >
              Compose ❧
            </button>
          )}
        </header>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* ────── VAULT VIEW ────── */}
          {view === "vault" && (
            <motion.div
              key="vault"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="vault-page relative min-h-full notebook-paper"
            >
              {/* Subtle paper grain */}
              <div className="vault-grain pointer-events-none absolute inset-0" />

              <div className="relative max-w-7xl mx-auto px-6 sm:px-10 py-8">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="vault-title">The&nbsp;Vault</h1>
                    <div className="vault-subtitle mt-1.5 flex items-center gap-2">
                      <span>
                        {sealedLetters.length} sealed Letter
                        {sealedLetters.length !== 1 ? "s" : ""}
                      </span>
                      <EnvelopeIcon />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={goToCompose}
                    className="vault-compose-btn"
                  >
                    <span>Compose</span>
                    <PencilIcon />
                  </button>
                </div>

                {/* Divider */}
                <div className="vault-divider mt-6 mb-8" />

                {letters.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-16">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-6xl mb-6"
                    >
                      💌
                    </motion.div>
                    <h2
                      className="text-2xl mb-2"
                      style={{
                        fontFamily: "var(--font-love-ya), cursive",
                        color: "#5d1a17",
                      }}
                    >
                      No letters yet
                    </h2>
                    <p className="text-[#7a3a32] text-sm max-w-xs mb-6">
                      The desk awaits. Write your first letter and seal it with
                      love.
                    </p>
                    <button
                      type="button"
                      onClick={goToCompose}
                      className="vault-compose-btn"
                    >
                      <span>Write a letter</span>
                      <PencilIcon />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {/* Sealed Letters */}
                    {sealedLetters.length > 0 && (
                      <section>
                        <h2 className="vault-section-title">
                          <span>
                            {sealedLetters.length} Sealed Letter
                            {sealedLetters.length !== 1 ? "s" : ""}
                          </span>
                          <EnvelopeIcon />
                        </h2>
                        <motion.div
                          initial="hidden"
                          animate="show"
                          variants={{
                            hidden: { opacity: 0 },
                            show: {
                              opacity: 1,
                              transition: { staggerChildren: 0.05 },
                            },
                          }}
                          className="vault-grid"
                        >
                          {sealedLetters.map((letter) => (
                            <motion.div
                              key={letter.id}
                              variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0 },
                              }}
                            >
                              <EnvelopeView
                                title={letter.title}
                                date={fmtDate(
                                  letter.delivered_at || letter.created_at
                                )}
                                stamp={letter.stamp_type}
                                flower={letter.flower_type}
                                isOpened={false}
                                cardMode
                                onOpen={() => openLetter(letter)}
                              />
                            </motion.div>
                          ))}
                        </motion.div>
                      </section>
                    )}

                    {/* Unsealed Letters */}
                    {unsealedLetters.length > 0 && (
                      <section>
                        <h2 className="vault-section-title">
                          <span>Unsealed Letters</span>
                          <EnvelopeIcon />
                        </h2>
                        <motion.div
                          initial="hidden"
                          animate="show"
                          variants={{
                            hidden: { opacity: 0 },
                            show: {
                              opacity: 1,
                              transition: { staggerChildren: 0.05 },
                            },
                          }}
                          className="vault-grid"
                        >
                          {unsealedLetters.map((letter) => (
                            <motion.div
                              key={letter.id}
                              variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0 },
                              }}
                            >
                              <EnvelopeView
                                title={letter.title}
                                date={fmtDate(
                                  letter.delivered_at || letter.created_at
                                )}
                                stamp={letter.stamp_type}
                                flower={letter.flower_type}
                                isOpened
                                cardMode
                                body={letter.body}
                                fontStyle={letter.font_style}
                                onOpen={() => openLetter(letter)}
                              />
                            </motion.div>
                          ))}
                        </motion.div>
                      </section>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ────── READING VIEW ────── */}
          {view === "reading" && activeLetter && (
            <motion.div
              key="reading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="max-w-lg mx-auto px-4 py-6"
            >
              <button
                onClick={goToVault}
                className="text-[12px] text-stone-500 mb-5 inline-flex items-center gap-1 cursor-pointer hover:text-stone-700 transition-colors"
              >
                ← back to vault
              </button>

              {/* Envelope */}
              <EnvelopeView
                title={activeLetter.title}
                date={new Date(
                  activeLetter.delivered_at || activeLetter.created_at
                ).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                stamp={activeLetter.stamp_type}
                flower={activeLetter.flower_type}
                isOpened={activeLetter.is_opened}
                body={activeLetter.body}
                fontStyle={activeLetter.font_style}
                onOpen={handleOpenEnvelope}
              />

              {/* Tap hint */}
              {!envelopeOpened && (
                <p
                  onClick={handleOpenEnvelope}
                  className="text-center text-[12px] text-stone-400 cursor-pointer mt-3 animate-pulse hover:text-stone-600"
                >
                  tap to unseal ↑
                </p>
              )}

              {/* Letter slides in */}
              <div
                className="mt-8 transition-all duration-500"
                style={{
                  opacity: envelopeOpened ? 1 : 0,
                  transform: envelopeOpened
                    ? "translateY(0)"
                    : "translateY(14px)",
                }}
              >
                {envelopeOpened && (
                  <LetterView
                    pages={readPages}
                    fontStyle={activeLetter.font_style}
                    colorTheme={activeLetter.color_theme}
                    deliveredAt={
                      activeLetter.delivered_at || activeLetter.created_at
                    }
                    currentPage={readPage}
                    totalPages={readPages.length}
                    onPageChange={(p) => {
                      setReadPage(p);
                      setAnimKey((k) => k + 1);
                    }}
                    animationKey={animKey}
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* ────── COMPOSE VIEW ────── */}
          {view === "compose" && (
            <motion.div
              key="compose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-6 px-4"
            >
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <button
                    onClick={goToVault}
                    className="text-[12px] text-stone-500 hover:text-stone-700 transition"
                  >
                    ← back to vault
                  </button>
                  <h2 className="text-[20px] font-[family-name:--font-playfair] italic text-stone-800 mt-3">
                    The Writer&apos;s Desk
                  </h2>
                </div>

                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
                    {errorMsg}
                  </div>
                )}

                {/* Split-screen layout */}
                <div
                  className="grid gap-5"
                  style={{ gridTemplateColumns: "1fr 272px" }}
                >
                  {/* ── LEFT: Notebook Paper ── */}
                  <div className="relative">
                    {/* Stacked paper shadow layers */}
                    <div
                      className="absolute rounded-[2px]"
                      style={{
                        top: 6,
                        left: 6,
                        right: -6,
                        bottom: -6,
                        background: "#e0cfa8",
                      }}
                    />
                    <div
                      className="absolute rounded-[2px]"
                      style={{
                        top: 3,
                        left: 3,
                        right: -3,
                        bottom: -3,
                        background: "#e8d8b4",
                      }}
                    />

                    <div
                      className="relative rounded-[2px] overflow-hidden min-h-[480px] paper-noise"
                      style={{
                        background: paperBg,
                        boxShadow: "0 2px 16px rgba(0,0,0,0.13)",
                      }}
                    >
                      {/* Notebook lines */}
                      <div
                        className="absolute inset-0 pointer-events-none z-[1]"
                        style={{
                          background: `linear-gradient(transparent 27px, ${lineColor} 28px) 0 52px / 100% 28px repeat-y`,
                        }}
                      />
                      {/* Margin */}
                      <div
                        className="absolute top-0 bottom-0 z-[1] pointer-events-none"
                        style={{
                          left: 54,
                          width: 1,
                          background: marginColor,
                        }}
                      />
                      {/* Holes */}
                      <div
                        className="absolute top-0 bottom-0 z-[2] flex flex-col gap-[100px] pt-[55px] pointer-events-none"
                        style={{ left: 17 }}
                      >
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className={`w-[13px] h-[13px] rounded-full border border-black/10 ${
                              colorTheme === "midnight"
                                ? "bg-black/20"
                                : "bg-white/55"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Writing area */}
                      <div
                        className="relative z-[3] pt-7 pb-6 pr-5"
                        style={{ paddingLeft: 68 }}
                      >
                        <input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Letter title..."
                          className="w-full border-none bg-transparent outline-none text-[13px] block mb-5 tracking-wide placeholder:text-stone-400/50"
                          style={{
                            color: inkColor,
                            fontFamily,
                            caretColor: inkColor,
                          }}
                        />
                        <textarea
                          ref={taRef}
                          value={pageContent}
                          onChange={(e) => handleBodyChange(e.target.value)}
                          placeholder="Begin your letter here..."
                          className="w-full border-none bg-transparent outline-none resize-none text-[17px] leading-[1.9] block placeholder:text-stone-400/40"
                          style={{
                            minHeight: 340,
                            color: inkColor,
                            fontFamily,
                            caretColor: inkColor,
                          }}
                        />
                      </div>

                      {/* Page nav */}
                      <div
                        className="flex items-center justify-between py-2 pr-5"
                        style={{
                          paddingLeft: 68,
                          borderTop: `0.5px solid ${
                            colorTheme === "midnight"
                              ? "rgba(255,255,255,0.07)"
                              : "rgba(0,0,0,0.07)"
                          }`,
                        }}
                      >
                        <button
                          onClick={() => changePage(-1)}
                          disabled={curPage === 0}
                          className="px-[9px] py-1 rounded-[10px] border-[0.5px] border-stone-300 text-[11px] text-stone-500 disabled:opacity-30 cursor-pointer hover:bg-stone-100 transition-colors"
                        >
                          ← Prev
                        </button>
                        <span className="text-[11px] text-stone-500">
                          Page {curPage + 1} of {pages.length}
                        </span>
                        <button
                          onClick={() => changePage(1)}
                          className="px-[9px] py-1 rounded-[10px] border-[0.5px] border-stone-300 text-[11px] text-stone-500 cursor-pointer hover:bg-stone-100 transition-colors"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── RIGHT: Settings Panel ── */}
                  <div className="rounded-xl p-[14px] flex flex-col gap-4 border border-stone-200/60 bg-white/70 backdrop-blur-sm self-start sticky top-24">
                    {/* Stationery Picker */}
                    <section>
                      <p className="text-[10px] tracking-[0.1em] uppercase text-stone-500 mb-[9px]">
                        Stationery
                      </p>
                      <div className="flex gap-2">
                        {(
                          Object.keys(THEME_CONFIG) as ColorTheme[]
                        ).map((t) => (
                          <div key={t} className="text-center">
                            <div
                              onClick={() => setColorTheme(t)}
                              className="w-10 h-10 rounded-[5px] cursor-pointer transition-all"
                              style={{
                                background: THEME_CONFIG[t].paperHex,
                                border:
                                  colorTheme === t
                                    ? "2px solid #5a3e28"
                                    : "0.5px solid rgba(0,0,0,0.14)",
                              }}
                            />
                            <p className="text-[9px] text-stone-500 mt-[3px]">
                              {THEME_CONFIG[t].label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Handwriting Picker */}
                    <section>
                      <p className="text-[10px] tracking-[0.1em] uppercase text-stone-500 mb-[9px]">
                        Handwriting
                      </p>
                      <div className="flex flex-col gap-[5px]">
                        {(
                          Object.entries(FONT_META) as [
                            FontStyle,
                            (typeof FONT_META)[FontStyle],
                          ][]
                        ).map(([id, f]) => (
                          <button
                            key={id}
                            onClick={() => setFontStyle(id)}
                            className={`px-[10px] py-2 rounded-md text-[15px] text-left flex items-center gap-2 transition-all ${FONT_CLASSNAMES[id]}`}
                            style={{
                              color: "#3d2b1f",
                              border: `0.5px solid ${
                                fontStyle === id
                                  ? "#b8933a"
                                  : "rgba(0,0,0,0.1)"
                              }`,
                              background:
                                fontStyle === id
                                  ? "rgba(184,147,58,0.06)"
                                  : "transparent",
                            }}
                          >
                            {f.label}
                            <em className="text-[10px] not-italic text-stone-400 font-sans">
                              {f.style}
                            </em>
                          </button>
                        ))}
                      </div>
                    </section>

                    {/* Stamp Picker */}
                    <StampPicker
                      value={stampType}
                      onChange={setStampType}
                    />

                    {/* Flower Picker */}
                    <FlowerPicker
                      value={flowerType}
                      onChange={setFlowerType}
                    />

                    {/* Recipient (collapsible) */}
                    <section>
                      <p className="text-[10px] tracking-[0.1em] uppercase text-stone-500 mb-[9px]">
                        Recipient
                      </p>
                      <input
                        type="text"
                        value={recipientId}
                        onChange={(e) => setRecipientId(e.target.value)}
                        placeholder="Recipient UUID"
                        className="w-full px-2 py-1.5 rounded-md border border-stone-200 bg-white text-[11px] text-stone-600 font-mono focus:outline-none focus:ring-1 focus:ring-stone-300"
                      />
                    </section>

                    {/* Envelope Preview */}
                    <section className="pt-1">
                      <p className="text-[10px] tracking-[0.1em] uppercase text-stone-500 mb-[9px]">
                        Preview
                      </p>
                      <div className="relative h-[90px] rounded-sm overflow-hidden" style={{ background: "#f0e0c0" }}>
                        <div className="absolute inset-0" style={{ clipPath: "polygon(0 0, 48% 50%, 0 100%)", background: "#e8d8b0" }} />
                        <div className="absolute inset-0" style={{ clipPath: "polygon(100% 0, 52% 50%, 100% 100%)", background: "#e8d8b0" }} />
                        <div className="absolute inset-0" style={{ clipPath: "polygon(0 100%, 50% 52%, 100% 100%)", background: "#dcc8a0" }} />
                        <div className="absolute inset-0" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: "#ddc890", height: "54%" }} />
                        {stampType && (
                          <div className="absolute flex items-center justify-center" style={{ top: 5, right: 5, width: 18, height: 22, background: "#f5e8c8", border: "1px solid #b8933a", zIndex: 10, fontSize: 10 }}>
                            {STAMP_EMOJI[stampType]}
                          </div>
                        )}
                        <div className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%,-42%)", zIndex: 10 }}>
                          <FlowerIcon type={flowerType} size={18} />
                        </div>
                        <div className="absolute" style={{ bottom: 6, left: 6, zIndex: 10 }}>
                          <p className="font-[family-name:--font-playfair] italic text-[8px] text-[#5a3e28] truncate max-w-[100px]">
                            {title || "Untitled"}
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Seal & Send */}
                    <button
                      onClick={handleSeal}
                      disabled={saving || !title.trim()}
                      className="w-full rounded-lg py-[11px] text-white text-[13px] transition-all disabled:opacity-40 font-[family-name:--font-playfair] italic tracking-wide cursor-pointer hover:opacity-90"
                      style={{
                        background: saved ? "#2e7d4f" : "#b83030",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {saving
                        ? "Sealing..."
                        : saved
                          ? "Sealed ✓"
                          : "Seal & Send ❧"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Small inline icons used in vault header / section labels ──

function EnvelopeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={(size * 14) / 18}
      viewBox="0 0 18 14"
      fill="none"
    >
      <path
        d="M2 2.5C2 1.67 2.67 1 3.5 1h11c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5h-11A1.5 1.5 0 0 1 2 11.5v-9Z"
        fill="#5d1a17"
      />
      <path
        d="M2.4 2.7 9 7.8l6.6-5.1"
        stroke="#f5e9d4"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function PencilIcon({ size = 16 }: { size?: number }) {
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

