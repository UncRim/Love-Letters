"use client";

import { useState, useRef, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
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

  const [title, setTitle] = useState("");
  const [pages, setPages] = useState<string[]>([""]);
  const [curPage, setCurPage] = useState(0);
  const [fontStyle, setFontStyle] = useState<FontStyle>("dancing_script");
  const [colorTheme, setColorTheme] = useState<ColorTheme>("vintage");
  const [stampType, setStampType] = useState<StampType | null>(null);
  const [flowerType, setFlowerType] = useState<FlowerType>("red_1");
  const [recipientId, setRecipientId] = useState(userId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const taRef = useRef<HTMLTextAreaElement>(null);

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

      const { error } = await supabase.from("letters").insert({
        author_id: user.id,
        recipient_id: recipientId || user.id,
        title: title.trim(),
        body: pages.join(PAGE_SEPARATOR),
        font_style: fontStyle,
        color_theme: colorTheme,
        stamp_type: stampType,
        flower_type: flowerType,
        delivered_at: new Date().toISOString(),
        is_draft: false,
      });

      if (error) throw error;
      setSaved(true);

      setTimeout(() => {
        startTransition(() => {
          router.push("/vault");
          router.refresh();
        });
      }, 1500);
    } catch (err) {
      console.error("Failed to seal letter:", err);
      setErrorMsg("Failed to send. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inkColor = THEME_CONFIG[colorTheme].inkHex;
  const paperBg = THEME_CONFIG[colorTheme].paperHex;
  const lineColor = THEME_CONFIG[colorTheme].line;
  const marginColor = THEME_CONFIG[colorTheme].margin;
  const fontFamily = FONT_META[fontStyle].family;
  const pageContent = pages[curPage] ?? "";

  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 272px" }}>
      {/* ── LEFT: Notebook Paper ── */}
      <div className="relative">
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
          <div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              background: `linear-gradient(transparent 27px, ${lineColor} 28px) 0 52px / 100% 28px repeat-y`,
            }}
          />
          <div
            className="absolute top-0 bottom-0 z-[1] pointer-events-none"
            style={{ left: 54, width: 1, background: marginColor }}
          />
          <div
            className="absolute top-0 bottom-0 z-[2] flex flex-col gap-[100px] pt-[55px] pointer-events-none"
            style={{ left: 17 }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-[13px] h-[13px] rounded-full border border-black/10 ${
                  colorTheme === "midnight" ? "bg-black/20" : "bg-white/55"
                }`}
              />
            ))}
          </div>

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

      {/* ── RIGHT: Settings ── */}
      <div className="rounded-xl p-[14px] flex flex-col gap-4 border border-stone-200/60 bg-white/70 backdrop-blur-sm self-start">
        {/* Stationery */}
        <section>
          <p className="text-[10px] tracking-[0.1em] uppercase text-stone-500 mb-[9px]">
            Stationery
          </p>
          <div className="flex gap-2">
            {(Object.keys(THEME_CONFIG) as ColorTheme[]).map((t) => (
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

        {/* Handwriting */}
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
                    fontStyle === id ? "#b8933a" : "rgba(0,0,0,0.1)"
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

        <StampPicker value={stampType} onChange={setStampType} />
        <FlowerPicker value={flowerType} onChange={setFlowerType} />

        {/* Recipient */}
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

        {/* Mini preview */}
        <section className="pt-1">
          <p className="text-[10px] tracking-[0.1em] uppercase text-stone-500 mb-[9px]">
            Preview
          </p>
          <div
            className="relative h-[90px] rounded-sm overflow-hidden"
            style={{ background: "#f0e0c0" }}
          >
            <div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(0 0, 48% 50%, 0 100%)",
                background: "#e8d8b0",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(100% 0, 52% 50%, 100% 100%)",
                background: "#e8d8b0",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(0 100%, 50% 52%, 100% 100%)",
                background: "#dcc8a0",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                background: "#ddc890",
                height: "54%",
              }}
            />
            <div
              className="absolute flex items-center justify-center"
              style={{
                top: 5,
                right: 5,
                width: 18,
                height: 22,
                background: "#f5e8c8",
                border: "1px solid #b8933a",
                zIndex: 10,
                fontSize: 10,
              }}
            >
              {stampType ? STAMP_EMOJI[stampType] : ""}
            </div>
            <div
              className="absolute"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-42%)",
                zIndex: 10,
              }}
            >
              <FlowerIcon type={flowerType} size={18} />
            </div>
            <div
              className="absolute"
              style={{ bottom: 6, left: 6, zIndex: 10 }}
            >
              <p className="font-[family-name:--font-playfair] italic text-[8px] text-[#5a3e28] truncate max-w-[100px]">
                {title || "Untitled"}
              </p>
            </div>
          </div>
        </section>

        {errorMsg && (
          <p className="text-[11px] text-red-600">{errorMsg}</p>
        )}

        {/* Seal & Send */}
        <button
          onClick={handleSeal}
          disabled={saving || !title.trim() || isPending}
          className={`vault-compose-btn w-full justify-center py-3 text-[17px] transition-all disabled:opacity-40 ${saved ? "vault-compose-btn--success" : ""}`}
        >
          {saving
            ? "Sealing..."
            : saved
              ? "Sealed ✓"
              : "Seal & Send ❧"}
        </button>
      </div>
    </div>
  );
}
