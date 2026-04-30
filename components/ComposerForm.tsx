"use client";

import { useState, useRef, useCallback, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FlowerIcon } from "./FlowerIcon";
import { StampPicker } from "./ui/StampPicker";
import { FlowerPicker } from "./ui/FlowerPicker";
import { LetterSealSuccessModal } from "./LetterSealSuccessModal";
import { FONT_CLASSNAMES } from "@/lib/fonts";
import {
  THEME_CONFIG,
  FONT_META,
  type FontStyle,
  type ColorTheme,
  type StampType,
  type FlowerType,
} from "@/lib/constants";

const DRAFT_STORAGE_KEY = "velle-compose-draft-v1";

interface DraftPayload {
  title: string;
  pages: string[];
  curPage: number;
  fontStyle: FontStyle;
  colorTheme: ColorTheme;
  stampType: StampType | null;
  flowerType: FlowerType;
}

export function ComposerForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [pages, setPages] = useState<string[]>([""]);
  const [curPage, setCurPage] = useState(0);
  const [fontStyle, setFontStyle] = useState<FontStyle>("dancing_script");
  const [colorTheme, setColorTheme] = useState<ColorTheme>("vintage");
  const [stampType, setStampType] = useState<StampType | null>(null);
  const [flowerType, setFlowerType] = useState<FlowerType>("red_1");
  const [secretKey, setSecretKey] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as DraftPayload;
      if (d.title) setTitle(d.title);
      if (Array.isArray(d.pages) && d.pages.length) setPages(d.pages);
      if (typeof d.curPage === "number") setCurPage(d.curPage);
      if (d.fontStyle) setFontStyle(d.fontStyle);
      if (d.colorTheme) setColorTheme(d.colorTheme);
      if (d.stampType !== undefined) setStampType(d.stampType);
      if (d.flowerType) setFlowerType(d.flowerType);
    } catch {
      /* ignore corrupt draft */
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      try {
        const draft: DraftPayload = {
          title,
          pages,
          curPage,
          fontStyle,
          colorTheme,
          stampType,
          flowerType,
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch {
        /* quota */
      }
    }, 30_000);
    return () => window.clearInterval(id);
  }, [title, pages, curPage, fontStyle, colorTheme, stampType, flowerType]);

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
          stamp_id: stampType,
          flower_id: flowerType,
        }),
      });

      const data = (await res.json()) as { shareUrl?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Seal failed");

      setSaved(true);
      setShareUrl(data.shareUrl ?? null);
      setShowSuccessModal(true);
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        /* noop */
      }
    } catch (err) {
      console.error("Failed to seal letter:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to send. Please try again."
      );
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
    <>
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
            className="relative z-[3] pb-6 pr-5 pt-[118px] sm:pt-[122px]"
            style={{ paddingLeft: 68 }}
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Letter title..."
              className="w-full border-none bg-transparent outline-none text-xl font-semibold block mb-5 tracking-wide placeholder:text-stone-400/50"
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

        {/* Share link — recipient opens via secret */}
        <section>
          <p className="text-[10px] tracking-[0.1em] uppercase text-stone-500 mb-[9px]">
            Delivery
          </p>
          <p className="text-[11px] leading-relaxed text-stone-600 font-[family-name:var(--font-dm-sans)] mb-3">
            Seal generates a unique link. Anyone with the link{" "}
            <strong className="font-medium text-[#5a3e28]">and</strong> your secret key can open it—then save it to their vault.
          </p>
          <label className="block text-[10px] uppercase tracking-[0.08em] text-stone-500 mb-1">
            Secret key
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="Choose a memorable key\u2026"
            className="w-full px-2 py-2 rounded-md border border-stone-200 bg-white text-[12px] text-stone-700 font-[family-name:var(--font-dm-sans)] focus:outline-none focus:ring-1 focus:ring-[#6B1B1B]/35"
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
          disabled={
            saving ||
            !title.trim() ||
            isPending ||
            secretKey.length < 4 ||
            saved
          }
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

    <LetterSealSuccessModal
      open={showSuccessModal}
      shareUrl={shareUrl}
      onContinueToVault={() => {
        setShowSuccessModal(false);
        startTransition(() => {
          router.push("/vault");
          router.refresh();
        });
      }}
    />
    </>
  );
}
