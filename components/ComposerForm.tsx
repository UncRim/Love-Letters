"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { StampPicker } from "./ui/StampPicker";
import { FlowerPicker } from "./ui/FlowerPicker";
import { LetterView } from "./LetterView";
import { createClient } from "@/lib/supabase/client";
import {
  FONT_STYLES,
  COLOR_THEMES,
  type FontStyle,
  type ColorTheme,
  type StampType,
  type FlowerType,
} from "@/lib/constants";

interface ComposerFormProps {
  userId: string;
}

export function ComposerForm({ userId }: ComposerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPreview, setShowPreview] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [fontStyle, setFontStyle] = useState<FontStyle>("dancing_script");
  const [colorTheme, setColorTheme] = useState<ColorTheme>("vintage");
  const [stampType, setStampType] = useState<StampType>("cherry_blossom");
  const [flowerType, setFlowerType] = useState<FlowerType>("rose");
  const [deliverAt, setDeliverAt] = useState("");
  const [recipientId, setRecipientId] = useState(userId);

  async function handleSend(draft: boolean) {
    setErrorMsg("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setErrorMsg("You must be signed in to send a letter.");
      return;
    }

    const { error } = await supabase.from("letters").insert({
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
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    startTransition(() => {
      router.push("/vault");
      router.refresh();
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Title */}
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

      {/* Recipient ID */}
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

      {/* Body */}
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

      {/* Style selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-600">Font</label>
          <select
            value={fontStyle}
            onChange={(e) => setFontStyle(e.target.value as FontStyle)}
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
          <label className="text-sm font-medium text-stone-600">Theme</label>
          <select
            value={colorTheme}
            onChange={(e) => setColorTheme(e.target.value as ColorTheme)}
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

      {/* Pickers */}
      <StampPicker value={stampType} onChange={setStampType} />
      <FlowerPicker value={flowerType} onChange={setFlowerType} />

      {/* Scheduled delivery */}
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

      {/* Preview toggle */}
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

      {/* Actions */}
      <div className="flex gap-3 pt-4">
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
  );
}
