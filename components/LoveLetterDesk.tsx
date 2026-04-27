"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { EnvelopeView } from "./EnvelopeView";
import { LetterView } from "./LetterView";
import { StampPicker } from "./ui/StampPicker";
import { FlowerPicker } from "./ui/FlowerPicker";
import { createClient } from "@/lib/supabase/client";
import {
  FONT_STYLES,
  COLOR_THEMES,
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

export function LoveLetterDesk({ initialLetters, userId }: LoveLetterDeskProps) {
  const router = useRouter();
  const [view, setView] = useState<View>("vault");
  const [letters, setLetters] = useState(initialLetters);
  const [activeLetter, setActiveLetter] = useState<Letter | null>(null);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Compose state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [fontStyle, setFontStyle] = useState<FontStyle>("dancing_script");
  const [colorTheme, setColorTheme] = useState<ColorTheme>("vintage");
  const [stampType, setStampType] = useState<StampType>("cherry_blossom");
  const [flowerType, setFlowerType] = useState<FlowerType>("rose");
  const [deliverAt, setDeliverAt] = useState("");
  const [recipientId, setRecipientId] = useState(userId);
  const [showPreview, setShowPreview] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const resetComposer = useCallback(() => {
    setTitle("");
    setBody("");
    setFontStyle("dancing_script");
    setColorTheme("vintage");
    setStampType("cherry_blossom");
    setFlowerType("rose");
    setDeliverAt("");
    setRecipientId(userId);
    setShowPreview(false);
    setErrorMsg("");
  }, [userId]);

  function openLetter(letter: Letter) {
    setActiveLetter(letter);
    setEnvelopeOpened(letter.is_opened);
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

  async function handleSend(draft: boolean) {
    setErrorMsg("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setErrorMsg("You must be signed in.");
      return;
    }

    const { data, error } = await supabase
      .from("letters")
      .insert({
        author_id: user.id,
        recipient_id: recipientId || user.id,
        title: title || null,
        body,
        font_style: fontStyle,
        color_theme: colorTheme,
        stamp_type: stampType,
        flower_type: flowerType,
        delivered_at: deliverAt ? new Date(deliverAt).toISOString() : null,
        is_draft: draft,
      })
      .select()
      .single();

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (data && !draft && (recipientId === userId || !recipientId)) {
      setLetters((prev) => [data as Letter, ...prev]);
    }

    goToVault();
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 border-b border-stone-200/60 flex items-center justify-between">
        <button onClick={goToVault} className="text-left">
          <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">
            Love Letters
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            {letters.length} letter{letters.length !== 1 ? "s" : ""} in your vault
          </p>
        </button>

        {view !== "compose" && (
          <button
            onClick={goToCompose}
            className="px-5 py-2.5 rounded-lg bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 transition shadow-sm"
          >
            Compose
          </button>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* ── VAULT VIEW ── */}
          {view === "vault" && (
            <motion.div
              key="vault"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="p-4"
            >
              {letters.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-6xl mb-6"
                  >
                    💌
                  </motion.div>
                  <h2 className="text-xl font-medium text-stone-700 mb-2">
                    No letters yet
                  </h2>
                  <p className="text-stone-500 text-sm max-w-xs mb-6">
                    Write your first letter and seal it with love.
                  </p>
                  <button
                    onClick={goToCompose}
                    className="px-6 py-2.5 rounded-lg bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 transition"
                  >
                    Write a letter
                  </button>
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
                  }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                >
                  {letters.map((letter) => (
                    <motion.div
                      key={letter.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 },
                      }}
                    >
                      <EnvelopeView
                        title={letter.title}
                        stampType={letter.stamp_type}
                        flowerType={letter.flower_type}
                        colorTheme={letter.color_theme}
                        isOpened={letter.is_opened}
                        deliveredAt={letter.delivered_at}
                        onClick={() => openLetter(letter)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── READING VIEW ── */}
          {view === "reading" && activeLetter && (
            <motion.div
              key="reading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="py-8 px-4"
            >
              <div className="max-w-lg mx-auto mb-6">
                <button
                  onClick={goToVault}
                  className="text-sm text-stone-500 hover:text-stone-700 transition"
                >
                  &larr; Back to vault
                </button>
              </div>

              <AnimatePresence mode="wait">
                {!envelopeOpened ? (
                  <motion.div
                    key="sealed"
                    className="max-w-xs mx-auto"
                    exit={{ opacity: 0, scale: 0.9, rotateX: 90 }}
                    transition={{ duration: 0.5 }}
                  >
                    <EnvelopeView
                      title={activeLetter.title}
                      stampType={activeLetter.stamp_type}
                      flowerType={activeLetter.flower_type}
                      colorTheme={activeLetter.color_theme}
                      isOpened={false}
                      deliveredAt={activeLetter.delivered_at}
                      onClick={handleOpenEnvelope}
                    />
                    <p className="text-center text-sm text-stone-400 mt-4 animate-pulse">
                      Tap to open
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="opened"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <LetterView
                      body={activeLetter.body}
                      fontStyle={activeLetter.font_style}
                      colorTheme={activeLetter.color_theme}
                      deliveredAt={
                        activeLetter.delivered_at || activeLetter.created_at
                      }
                      title={activeLetter.title ?? undefined}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── COMPOSE VIEW ── */}
          {view === "compose" && (
            <motion.div
              key="compose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-8 px-4"
            >
              <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                  <button
                    onClick={goToVault}
                    className="text-sm text-stone-500 hover:text-stone-700 transition"
                  >
                    &larr; Back to vault
                  </button>
                  <h2 className="text-2xl font-semibold text-stone-800 tracking-tight mt-4">
                    Compose a letter
                  </h2>
                  <p className="text-sm text-stone-500 mt-1">
                    Choose your stationery, write from the heart, and seal it with love.
                  </p>
                </div>

                <div className="space-y-8">
                  {errorMsg && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                      {errorMsg}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-600">
                      Title (envelope label)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="A letter for you..."
                      className="w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-600">
                      Recipient User ID
                    </label>
                    <input
                      type="text"
                      value={recipientId}
                      onChange={(e) => setRecipientId(e.target.value)}
                      placeholder="UUID of the recipient"
                      className="w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 transition font-mono"
                    />
                    <p className="text-xs text-stone-400">
                      Pre-filled with your own ID — send yourself a letter to test.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-600">
                      Your letter
                    </label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={10}
                      placeholder="Write from the heart..."
                      className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white text-stone-800 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-stone-300 transition resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-stone-600">
                        Font
                      </label>
                      <select
                        value={fontStyle}
                        onChange={(e) =>
                          setFontStyle(e.target.value as FontStyle)
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                      >
                        {FONT_STYLES.map((f) => (
                          <option key={f} value={f}>
                            {f.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-stone-600">
                        Theme
                      </label>
                      <select
                        value={colorTheme}
                        onChange={(e) =>
                          setColorTheme(e.target.value as ColorTheme)
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                      >
                        {COLOR_THEMES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <StampPicker value={stampType} onChange={setStampType} />
                  <FlowerPicker value={flowerType} onChange={setFlowerType} />

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-600">
                      Deliver at (optional — leave blank for immediate)
                    </label>
                    <input
                      type="datetime-local"
                      value={deliverAt}
                      onChange={(e) => setDeliverAt(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-sm text-stone-500 underline underline-offset-4 hover:text-stone-700 transition"
                  >
                    {showPreview ? "Hide preview" : "Preview letter"}
                  </button>

                  {showPreview && body && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <LetterView
                        body={body}
                        fontStyle={fontStyle}
                        colorTheme={colorTheme}
                        deliveredAt={deliverAt || new Date().toISOString()}
                        title={title}
                      />
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-4 pb-8">
                    <button
                      type="button"
                      onClick={() => handleSend(true)}
                      disabled={!body || isPending}
                      className="flex-1 py-3 rounded-lg border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition disabled:opacity-40"
                    >
                      Save draft
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSend(false)}
                      disabled={!body || isPending}
                      className="flex-1 py-3 rounded-lg bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 transition disabled:opacity-40"
                    >
                      {isPending ? "Sending..." : "Send letter"}
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
