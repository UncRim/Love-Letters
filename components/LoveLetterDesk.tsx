"use client";

import { useState, useRef, useCallback, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { EnvelopeView, EnvelopeComposePreview } from "./EnvelopeView";
import { LetterView } from "./LetterView";
import { PostageStampCluster } from "./PostageStampCluster";
import { StampPicker } from "./ui/StampPicker";
import { BrandLogo } from "./BrandLogo";
import { FlowerPicker } from "./ui/FlowerPicker";
import { LetterSealSuccessModal } from "./LetterSealSuccessModal";
import { SendMailIcon } from "./SendMailIcon";
import { createClient } from "@/lib/supabase/client";
import { FONT_CLASSNAMES } from "@/lib/fonts";
import {
  THEME_CONFIG,
  FONT_META,
  PAGE_SEPARATOR,
  type Letter,
  type FontStyle,
  type ColorTheme,
  type StampType,
  type FlowerType,
} from "@/lib/constants";
import { stampsFromLetter } from "@/lib/letter-content";

type View = "vault" | "compose" | "reading";
type VaultTab = "sealed" | "unsealed";

interface LoveLetterDeskProps {
  initialLetters: Letter[];
  userId: string;
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
  const [vaultTab, setVaultTab] = useState<VaultTab>("unsealed");
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
  const [stampTypes, setStampTypes] = useState<StampType[]>([]);
  const [flowerType, setFlowerType] = useState<FlowerType>("red_1");
  const [secretKey, setSecretKey] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
    setStampTypes([]);
    setFlowerType("red_1");
    setSecretKey("");
    setShareUrl(null);
    setShowSuccessModal(false);
    setSaving(false);
    setSaved(false);
    setErrorMsg("");
  }, []);

  // ── Vault actions ──

  // Marks a letter as opened in the DB and locally toggles the envelope
  // open in the reading view. Extracted so both `openLetter` (auto-open
  // for sealed letters in vault) and `handleOpenEnvelope` (manual opener
  // already inside reading view) can share the same code path.
  async function openEnvelopeRecord(letter: Letter) {
    const supabase = createClient();
    await supabase
      .from("letters")
      .update({ is_opened: true, opened_at: new Date().toISOString() })
      .eq("id", letter.id);

    setEnvelopeOpened(true);
    setLetters((prev) =>
      prev.map((l) => (l.id === letter.id ? { ...l, is_opened: true } : l))
    );
    setTimeout(() => setAnimKey((k) => k + 1), 950);
  }

  function openLetter(letter: Letter) {
    setActiveLetter(letter);
    setEnvelopeOpened(letter.is_opened);
    setReadPage(0);
    setView("reading");

    // Sealed letter: auto-trigger the unseal animation a moment after
    // navigation so the user sees a brief "closed envelope" beat, then it
    // pops open and the letter rises out — one click instead of two.
    if (!letter.is_opened) {
      setTimeout(() => {
        void openEnvelopeRecord(letter);
      }, 650);
    }
  }

  async function handleOpenEnvelope() {
    if (!activeLetter) return;
    await openEnvelopeRecord(activeLetter);
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
    if (secretKey.length < 4) {
      setErrorMsg("Choose a secret key (at least 4 characters).");
      return;
    }
    setErrorMsg("");
    setSaving(true);

    try {
      const res = await fetch("/api/letters/seal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          pages,
          secretKey,
          font_style: fontStyle,
          color_theme: colorTheme,
          stamp_ids: stampTypes,
          flower_id: flowerType,
        }),
      });

      const data = (await res.json()) as { shareUrl?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Seal failed");

      setSaved(true);
      setShareUrl(data.shareUrl ?? null);
      setShowSuccessModal(true);
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
  const composePreviewBody = pages.join(PAGE_SEPARATOR);

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

  useEffect(() => {
    if (
      vaultTab === "unsealed" &&
      unsealedLetters.length === 0 &&
      sealedLetters.length > 0
    ) {
      setVaultTab("sealed");
    } else if (
      vaultTab === "sealed" &&
      sealedLetters.length === 0 &&
      unsealedLetters.length > 0
    ) {
      setVaultTab("unsealed");
    }
  }, [vaultTab, sealedLetters.length, unsealedLetters.length]);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="desk-header sticky top-0 z-40 shrink-0">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 sm:px-10">
          <button type="button" onClick={goToVault} className="text-left group min-w-0">
            <span className="inline-block transition-opacity group-hover:opacity-[0.88]">
              <BrandLogo size="desk" />
            </span>
          </button>

          {view === "compose" ? (
            <button
              type="button"
              onClick={handleSeal}
              disabled={
                saving ||
                !title.trim() ||
                pages.every((p) => !p.trim()) ||
                secretKey.length < 4 ||
                saved
              }
              className="vault-compose-btn shrink-0 px-5 py-2.5 text-[16px] disabled:opacity-40 disabled:pointer-events-none"
            >
              {saving || saved ? null : (
                <span aria-hidden className="inline-flex shrink-0 opacity-[0.92]">
                  <SendMailIcon size={17} />
                </span>
              )}
              <span>{saving ? "Sending…" : saved ? "Sent ✓" : "Send"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={goToCompose}
              className="vault-compose-btn shrink-0 py-2.5 px-5 text-[15px]"
            >
              <span>Compose</span>
              <PencilIcon />
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          {/* ────── VAULT VIEW ────── */}
          {view === "vault" && (
            <motion.div
              key="vault"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="desk-canvas vault-page relative min-h-full"
            >
              <div className="vault-grain pointer-events-none absolute inset-0" />

              <div className="relative max-w-7xl mx-auto px-6 sm:px-10 pt-4 pb-8 sm:pt-5">
                {/* Page title — Compose lives in the sticky desk header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="vault-title">The&nbsp;Vault</h1>
                  </div>
                </div>

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
                  <div className="mt-6">
                    <div
                      className="vault-tabs"
                      role="tablist"
                      aria-label="Letters by seal status"
                    >
                      <button
                        type="button"
                        id="vault-tab-sealed"
                        role="tab"
                        aria-selected={vaultTab === "sealed"}
                        aria-controls="vault-panel-sealed"
                        className={
                          vaultTab === "sealed"
                            ? "vault-tab vault-tab--active"
                            : "vault-tab"
                        }
                        onClick={() => setVaultTab("sealed")}
                      >
                        <span>
                          {sealedLetters.length} Sealed Letter
                          {sealedLetters.length !== 1 ? "s" : ""}
                        </span>
                        <EnvelopeIcon />
                      </button>
                      <button
                        type="button"
                        id="vault-tab-unsealed"
                        role="tab"
                        aria-selected={vaultTab === "unsealed"}
                        aria-controls="vault-panel-unsealed"
                        className={
                          vaultTab === "unsealed"
                            ? "vault-tab vault-tab--active"
                            : "vault-tab"
                        }
                        onClick={() => setVaultTab("unsealed")}
                      >
                        <span>Unsealed Letters</span>
                        <EnvelopeIcon />
                      </button>
                    </div>

                    {vaultTab === "sealed" ? (
                      <section
                        id="vault-panel-sealed"
                        role="tabpanel"
                        aria-labelledby="vault-tab-sealed"
                        className="vault-letter-section pt-2.5"
                      >
                        {sealedLetters.length === 0 ? (
                          <p className="vault-tab-empty">
                            No sealed letters yet. New deliveries appear here
                            until you open them.
                          </p>
                        ) : (
                          <motion.div
                            key="sealed-grid"
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
                                  stamps={stampsFromLetter(letter)}
                                  flower={letter.flower_type}
                                  isOpened={false}
                                  cardMode
                                  onOpen={() => openLetter(letter)}
                                />
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </section>
                    ) : (
                      <section
                        id="vault-panel-unsealed"
                        role="tabpanel"
                        aria-labelledby="vault-tab-unsealed"
                        className="vault-letter-section pt-2.5"
                      >
                        {unsealedLetters.length === 0 ? (
                          <p className="vault-tab-empty">
                            No unsealed letters yet. Open one from the Sealed
                            tab to read it here.
                          </p>
                        ) : (
                          <motion.div
                            key="unsealed-grid"
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
                                  stamps={stampsFromLetter(letter)}
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
                        )}
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
              className="desk-canvas vault-page relative min-h-full"
            >
              <div className="vault-grain pointer-events-none absolute inset-0" />
              <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6">
                <button
                  type="button"
                  onClick={goToVault}
                  className="desk-back-link mb-5"
                >
                  <span aria-hidden>←</span>
                  Back to vault
                </button>

              <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-10 xl:gap-12">
                <aside className="shrink-0 flex flex-col items-center lg:items-stretch lg:w-[240px] lg:sticky lg:top-24 lg:self-start">
                  <div className="w-[228px] max-w-[85vw] mx-auto lg:mx-0">
                    <EnvelopeView
                      title={activeLetter.title}
                      date={new Date(
                        activeLetter.delivered_at || activeLetter.created_at
                      ).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      stamps={stampsFromLetter(activeLetter)}
                      flower={activeLetter.flower_type}
                      isOpened={activeLetter.is_opened}
                      body={activeLetter.body}
                      fontStyle={activeLetter.font_style}
                      onOpen={handleOpenEnvelope}
                      readingEnvelopeWidth={228}
                    />
                  </div>
                  {!envelopeOpened && (
                    <p className="text-center text-[13px] text-stone-400 mt-3 animate-pulse lg:px-1">
                      opening…
                    </p>
                  )}
                </aside>

                <div className="flex-1 min-w-0 w-full flex justify-center lg:pt-1">
                  <AnimatePresence>
                    {envelopeOpened && (
                      <motion.div
                        key="letter-paper"
                        initial={{ opacity: 0, y: 48, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.96 }}
                        transition={{
                          duration: 0.65,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="w-full max-w-3xl origin-top"
                      >
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
                          widePaper
                          stamps={stampsFromLetter(activeLetter)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              </div>
            </motion.div>
          )}
          {view === "compose" && (
            <motion.div
              key="compose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="desk-canvas vault-page relative min-h-full"
            >
              <div className="vault-grain pointer-events-none absolute inset-0" />
              <div className="relative py-8 px-4 sm:px-8">
              <div className="max-w-5xl mx-auto">
                <div className="mb-7">
                  <button
                    type="button"
                    onClick={goToVault}
                    className="desk-back-link"
                  >
                    <span aria-hidden>←</span>
                    Back to vault
                  </button>
                  <h2 className="vault-subtitle text-[clamp(22px,3vw,30px)] mt-4 leading-tight">
                    The Writer&apos;s Desk
                  </h2>
                  <p className="text-[13px] text-[#5d1a17]/55 mt-1.5 max-w-xl">
                    Stationery, flower, and handwriting update the preview.
                    Postage shows on the notepad only; share your sealed letter
                    with the link after you send.
                  </p>
                </div>

                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
                    {errorMsg}
                  </div>
                )}

                {/* Split layout — stacks on narrow; xl row height = sidebar, paper stretches to match */}
                <div className="grid gap-8 lg:gap-10 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(272px,300px)] xl:items-stretch">
                  {/* ── LEFT: Notebook Paper ── */}
                  <div className="relative min-h-[480px] h-full flex flex-col">
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
                      className="relative flex flex-col flex-1 min-h-0 rounded-[3px] overflow-hidden paper-noise h-full min-h-[480px]"
                      style={{
                        background: paperBg,
                        boxShadow:
                          "0 4px 22px rgba(40,28,18,0.11), 0 1px 3px rgba(40,28,18,0.06)",
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

                      <PostageStampCluster
                        stamps={stampTypes}
                        variant="sheet"
                        emptyLabel="Stamp here"
                        emptyLabelClassName={
                          colorTheme === "midnight"
                            ? "text-stone-400"
                            : "text-stone-500"
                        }
                      />

                      {/* Writing area — top padding clears the postage stamp (top-right); ruled lines stay aligned */}
                      <div
                        className="relative z-[3] flex flex-col flex-1 min-h-0 pb-4 pr-5 pt-[172px] sm:pt-[184px]"
                        style={{ paddingLeft: 68 }}
                      >
                        <input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Letter title..."
                          className="w-full shrink-0 border-none bg-transparent outline-none text-xl font-semibold block mb-4 tracking-wide placeholder:text-stone-400/50"
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
                          className="w-full flex-1 min-h-[240px] border-none bg-transparent outline-none resize-none text-[17px] leading-[1.9] block placeholder:text-stone-400/40"
                          style={{
                            color: inkColor,
                            fontFamily,
                            caretColor: inkColor,
                          }}
                        />
                      </div>

                      {/* Page nav */}
                      <div
                        className="flex shrink-0 items-center justify-between py-2 pr-5 mt-auto"
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

                  {/* ── RIGHT: Preview first, then stationery & picks ── */}
                  <div className="rounded-2xl p-4 flex flex-col gap-5 border border-[var(--desk-header-border)] bg-[var(--brand-surface-header)] backdrop-blur-md shadow-[0_6px_24px_rgba(45,28,12,0.07)] xl:sticky xl:top-24 xl:self-start">
                    {/* Live preview — blank opened envelope (top of sidebar) */}
                    <section className="pb-1 border-b border-[rgba(120,75,35,0.15)]">
                      <p className="text-[10px] tracking-[0.12em] uppercase text-[#5d1a17]/65 mb-2">
                        Preview
                      </p>
                      <p className="text-[11px] text-stone-600/90 mb-3 leading-snug">
                        First lines only (same cap as vault cards). Longer text
                        stays on your pages.
                      </p>
                      <EnvelopeComposePreview
                        title={title}
                        body={composePreviewBody}
                        fontStyle={fontStyle}
                        flower={flowerType}
                      />
                    </section>

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
                      value={stampTypes}
                      onChange={setStampTypes}
                    />

                    {/* Flower Picker */}
                    <FlowerPicker
                      value={flowerType}
                      onChange={setFlowerType}
                    />

                    {/* Delivery — secret key for hybrid share link */}
                    <section>
                      <p className="text-[10px] tracking-[0.1em] uppercase text-stone-500 mb-[9px]">
                        Delivery
                      </p>
                      <p className="text-[11px] leading-relaxed text-stone-600 mb-3 font-[family-name:var(--font-dm-sans)]">
                        Choose a secret key. After you send, you&apos;ll get a
                        shareable link — recipients need both the link and key to open.
                      </p>
                      <label className="block text-[10px] uppercase tracking-[0.08em] text-stone-500 mb-1">
                        Secret key
                      </label>
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        placeholder="At least 4 characters\u2026"
                        className="w-full px-2 py-2 rounded-md border border-stone-200 bg-white text-[12px] text-stone-700 font-[family-name:var(--font-dm-sans)] focus:outline-none focus:ring-1 focus:ring-[#6B1B1B]/35"
                      />
                    </section>

                    {/* Seal & Send */}
                    <button
                      onClick={handleSeal}
                      disabled={
                        saving ||
                        !title.trim() ||
                        pages.every((p) => !p.trim()) ||
                        secretKey.length < 4 ||
                        saved
                      }
                      className={`vault-compose-btn w-full justify-center py-3.5 text-[17px] transition-all disabled:opacity-40 disabled:pointer-events-none ${saved ? "vault-compose-btn--success" : ""}`}
                    >
                      {saving ? (
                        "Sealing…"
                      ) : saved ? (
                        "Sealed ✓"
                      ) : (
                        <>
                          <span aria-hidden className="inline-flex shrink-0 opacity-[0.92]">
                            <SendMailIcon size={18} />
                          </span>
                          Seal & send
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LetterSealSuccessModal
        open={showSuccessModal}
        shareUrl={shareUrl}
        onContinueToVault={() => {
          setShowSuccessModal(false);
          startTransition(() => {
            goToVault();
            router.refresh();
          });
        }}
      />
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

