"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FLOWER_IMAGE,
  PAGE_SEPARATOR,
  type StampType,
  type FlowerType,
  type FontStyle,
} from "@/lib/constants";
import { FONT_CLASSNAMES } from "@/lib/fonts";

interface EnvelopeViewProps {
  title: string | null;
  date: string;
  stamp: StampType | null;
  flower: FlowerType | null;
  isOpened?: boolean;
  cardMode?: boolean;
  onOpen?: () => void;
  /** Letter body — rendered on the paper area of opened envelopes. */
  body?: string;
  /** Handwriting style for the paper preview. */
  fontStyle?: FontStyle;
}

// Stamps from /public/stamps/*.svg, indexed by available stamp_type values.
// Some stamp_type strings are decorative emojis only; map best-fit landmarks for the rest.
const STAMP_IMAGE: Partial<Record<StampType, string>> = {
  cherry_blossom: "/stamps/eiffel.svg",
  butterfly: "/stamps/big-ben.svg",
  moon: "/stamps/liberty.svg",
  star: "/stamps/eiffel.svg",
  dove: "/stamps/big-ben.svg",
  letter: "/stamps/egypt.svg",
  rose: "/stamps/eiffel.svg",
  sun: "/stamps/egypt.svg",
};

// ─────────────────────────────────────────────────────────────────────────────
// Envelope geometry (opened-blank.svg, viewBox 326×346).
//
// All coordinates are pulled directly from the SVG path data so the overlays
// line up pixel-perfectly with the artwork.
//
//   Paper (white letter sheet, parallelogram tilted ≈ 5°):
//     TL ( 82.30,   2.42)   →  25.25%, 0.70%
//     TR (254.50,  17.48)   →  78.07%, 5.05%
//     BR (236.98, 217.70)   →  72.69%, 62.92%
//     BL ( 64.83, 202.60)   →  19.89%, 58.55%
//
//   V-flap (front triangle of the envelope, with rounded apex):
//     LB    (24.42, 265.03) → 7.49%,  76.59%
//     L_ELB (147.39, 161.58)→ 45.21%, 46.70%
//     APEX_L(158.71, 153.77)→ 48.68%, 44.44%
//     APEX_R(167.01, 153.77)→ 51.23%, 44.44%
//     R_ELB (178.36, 161.58)→ 54.71%, 46.70%
//     RB    (301.30, 265.03)→ 92.43%, 76.59%
//
// Visible-paper polygon = paper rect ∩ (above V-flap top edge).
// Found by intersecting:
//   • paper right edge  (254.5,17.48)→(236.98,217.7)  with
//     V-flap right segment (178.36,161.58)→(301.30,265.03)
//     → (237.54, 211.38)  →  72.86%, 61.09%
//   • paper bottom edge (64.83,202.6)→(236.98,217.7)  with
//     V-flap left segment  (147.39,161.58)→(24.42,265.03)
//     →  (95.42, 205.30)  →  29.27%, 59.34%
//
// Walking the visible-paper boundary clockwise from paper TL:
//   1. paper TL              25.25%, 0.70%
//   2. paper TR              78.07%, 5.05%
//   3. paper R ∩ V-flap R    72.86%, 61.09%
//   4. V-flap right elbow    54.71%, 46.70%
//   5. V-flap apex right     51.23%, 44.44%
//   6. V-flap apex left      48.68%, 44.44%
//   7. V-flap left elbow     45.21%, 46.70%
//   8. V-flap L ∩ paper bot. 29.27%, 59.34%
//   9. paper BL              19.89%, 58.55%
//
// This polygon is what we clip the text overlay to so words can never
// paint on the V-flap face.
// ─────────────────────────────────────────────────────────────────────────────
const VISIBLE_PAPER_CLIP =
  "polygon(25.25% 0.70%, 78.07% 5.05%, 72.86% 61.09%, 54.71% 46.70%, 51.23% 44.44%, 48.68% 44.44%, 45.21% 46.70%, 29.27% 59.34%, 19.89% 58.55%)";

// V-flap polygon (front face of the envelope), traced from the same path.
// Used both to mask flower stems and as a defensive top layer that hides
// any rendering bleed below the V-flap apex.
const VFLAP_CLIP_PATH =
  "polygon(7.49% 76.59%, 45.21% 46.70%, 48.68% 44.44%, 51.23% 44.44%, 54.71% 46.70%, 92.43% 76.59%)";

// The paper sheet is rotated ≈ 5° clockwise relative to the envelope; we
// tilt the text frame the same amount so handwriting follows the paper.
const PAPER_TILT_DEG = 5;

// Text frame anchored to the paper rectangle. The frame is intentionally
// generous; anything that would land past the V-flap apex is hard-clipped
// by VISIBLE_PAPER_CLIP, so we don't have to reason about exact bottom edges.
//   left/top   ≈ paper TL + small inset
//   width      ≈ paper width minus side margins
//   height     ≈ full paper height (clip handles the V cut)
const PAPER_BOX = {
  left: "27.6%", //   ≈ x  90 / 326
  top: "3.5%", //     ≈ y  12 / 346
  width: "47.0%", //  ≈ 153 / 326   (paper TR.x ≈ 254 → right margin ≈ 11)
  height: "55.0%", // ≈ 190 / 346   (clip removes anything past the V apex)
};

// Bouquet sits to the right of the paper. Its head peeks above the V-flap
// apex, its stems slide down past the apex and are visually masked by the
// V-flap overlay layered on top.
const FLOWER_BOX = {
  left: "53%", //  envelope x ≈ 173
  top: "10%", //   envelope y ≈ 35
  width: "39%", //  right edge ≈ 92%
  height: "60%", // bottom ≈ y=208 (well into the V-flap face)
};

export function EnvelopeView({
  title,
  date,
  stamp,
  flower,
  isOpened = false,
  cardMode = false,
  onOpen,
  body,
  fontStyle,
}: EnvelopeViewProps) {
  const [flipped, setFlipped] = useState(false);

  // ─────────────────────────────────────
  // Card mode (vault grid)
  // ─────────────────────────────────────
  if (cardMode) {
    return (
      <motion.button
        type="button"
        onClick={onOpen}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className="group relative block w-full bg-transparent border-0 p-0 cursor-pointer text-left"
      >
        {isOpened ? (
          <OpenedEnvelopeArt
            flower={flower}
            title={title}
            body={body}
            fontStyle={fontStyle}
          />
        ) : (
          <ClosedEnvelopeArt stamp={stamp} />
        )}

        {/* Caption: title + date (handwritten marker style) */}
        <div className="mt-2 flex items-baseline justify-between gap-2 px-1">
          <p
            className="truncate text-[14px] leading-tight"
            style={{
              fontFamily: "var(--font-love-ya), cursive",
              color: "#5d1a17",
            }}
            title={title || "A letter for you"}
          >
            {title || "A letter for you"}
          </p>
          <p
            className="shrink-0 text-[13px]"
            style={{
              fontFamily: "var(--font-love-ya), cursive",
              color: "#7a3a32",
            }}
          >
            {date}
          </p>
        </div>
      </motion.button>
    );
  }

  // ─────────────────────────────────────
  // Reading mode (large envelope on letter detail screen)
  // ─────────────────────────────────────
  return (
    <div className="relative mx-auto" style={{ width: 320 }}>
      <AnimatePresence mode="wait">
        {flipped || isOpened ? (
          <motion.div
            key="opened"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          >
            <OpenedEnvelopeArt
              flower={flower}
              title={title}
              body={body}
              fontStyle={fontStyle}
              large
            />
          </motion.div>
        ) : (
          <motion.button
            key="closed"
            type="button"
            onClick={() => {
              setFlipped(true);
              setTimeout(() => onOpen?.(), 600);
            }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45 }}
            className="block w-full bg-transparent border-0 p-0 cursor-pointer"
          >
            <ClosedEnvelopeArt stamp={stamp} large />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────
// Closed envelope (uses the closed.svg artwork directly)
// ─────────────────────────────────────
function ClosedEnvelopeArt({
  stamp,
  large = false,
}: {
  stamp: StampType | null;
  large?: boolean;
}) {
  const stampSrc = stamp ? STAMP_IMAGE[stamp] : null;

  return (
    <div
      className="relative w-full"
      style={{
        // 328×274 native aspect ratio
        aspectRatio: "328 / 274",
      }}
    >
      <Image
        src="/envelopes/closed.svg"
        alt="Sealed envelope"
        fill
        sizes={large ? "320px" : "(max-width: 768px) 50vw, 240px"}
        priority={large}
        className="object-contain select-none"
        draggable={false}
      />

      {/* Stamp overlay (top-left corner) */}
      {stampSrc && (
        <div
          className="absolute"
          style={{
            top: large ? "10%" : "9%",
            left: large ? "9%" : "8%",
            width: large ? 56 : 38,
            height: large ? 56 : 38,
          }}
        >
          <div
            className="relative w-full h-full"
            style={{
              transform: "rotate(-6deg)",
              filter:
                "drop-shadow(0 1px 1px rgba(0,0,0,0.18)) drop-shadow(0 2px 4px rgba(0,0,0,0.10))",
            }}
          >
            <Image
              src={stampSrc}
              alt="Postage stamp"
              fill
              sizes="56px"
              className="object-contain"
              draggable={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────
// Opened envelope (uses opened-blank.svg + dynamic flower overlay)
// ─────────────────────────────────────
//
// Render order (bottom → top):
//   1. base envelope SVG          (paper + V-flap drawn from the artwork)
//   2. flower bouquet              (positioned upper-right, full-height stems)
//   3. V-flap clip overlay         (duplicate SVG masked to the V-flap so
//                                   flower stems & any other bleed disappear
//                                   behind the front of the envelope)
//   4. text overlay                (clipped to VISIBLE_PAPER_CLIP so words
//                                   physically cannot land on the V-flap)
function OpenedEnvelopeArt({
  flower,
  title,
  body,
  fontStyle,
  large = false,
}: {
  flower: FlowerType | null;
  title?: string | null;
  body?: string;
  fontStyle?: FontStyle;
  large?: boolean;
}) {
  const flowerSrc = flower ? FLOWER_IMAGE[flower] : null;

  // First page only — the rest is reserved for LetterView (full reader).
  // Card mode shows a much shorter preview to match the small visible paper
  // area in the vault grid.
  const firstPage = (body ?? "").split(PAGE_SEPARATOR)[0]?.trim() ?? "";
  const previewLimit = large ? 320 : 90;
  const preview =
    firstPage.length > previewLimit
      ? `${firstPage.slice(0, previewLimit).trimEnd()}…`
      : firstPage;

  // `next/font/google` exposes loaded fonts via per-font className strings.
  // Using these guarantees the actual webfont (e.g. Caveat) is applied;
  // falling back to a literal `'Caveat'` family does not work because the
  // font is shipped under a hashed name.
  const fontClassName = fontStyle ? FONT_CLASSNAMES[fontStyle] : "";

  return (
    <div
      className="relative w-full"
      style={{
        // 326×346 native aspect ratio
        aspectRatio: "326 / 346",
      }}
    >
      {/* 1. Base envelope artwork ─────────────────────────────────────── */}
      <Image
        src="/envelopes/opened-blank.svg"
        alt="Opened envelope with letter"
        fill
        sizes={large ? "320px" : "(max-width: 768px) 50vw, 240px"}
        priority={large}
        className="object-contain select-none"
        draggable={false}
      />

      {/* 2. Flower bouquet (only when a flower is selected) ─────────────
            Stems hang past the V-flap apex; the next layer hides them. */}
      {flowerSrc && (
        <div className="absolute pointer-events-none" style={FLOWER_BOX}>
          <div
            className="relative w-full h-full"
            style={{
              filter:
                "drop-shadow(0 4px 6px rgba(0,0,0,0.18)) drop-shadow(0 1px 2px rgba(0,0,0,0.12))",
            }}
          >
            <Image
              src={flowerSrc}
              alt="Flower"
              fill
              sizes={large ? "180px" : "120px"}
              className="object-contain object-bottom"
              draggable={false}
            />
          </div>
        </div>
      )}

      {/* 3. V-flap mask overlay ─────────────────────────────────────────
            Duplicate of the envelope SVG clipped to *only* the V-flap.
            Always rendered (not gated on flower) so it also acts as a
            backstop hiding any rendering that lands on the V-flap face. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          clipPath: VFLAP_CLIP_PATH,
          WebkitClipPath: VFLAP_CLIP_PATH,
        }}
      >
        <Image
          src="/envelopes/opened-blank.svg"
          alt=""
          fill
          sizes={large ? "320px" : "(max-width: 768px) 50vw, 240px"}
          className="object-contain select-none"
          aria-hidden
          draggable={false}
        />
      </div>

      {/* 4. Text overlay clipped to the visible paper polygon ───────────
            VISIBLE_PAPER_CLIP describes the exact region of the paper
            that shows above the V-flap, so the text physically cannot
            paint on the flap — even if the body wraps past the apex. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          clipPath: VISIBLE_PAPER_CLIP,
          WebkitClipPath: VISIBLE_PAPER_CLIP,
        }}
      >
        <div
          className={`absolute ${fontClassName}`}
          style={{
            left: PAPER_BOX.left,
            top: PAPER_BOX.top,
            width: PAPER_BOX.width,
            height: PAPER_BOX.height,
            transform: `rotate(${PAPER_TILT_DEG}deg)`,
            transformOrigin: "0% 0%",
            color: "#2a1c12",
            fontSize: large ? 14 : 9,
            lineHeight: 1.42,
            letterSpacing: large ? 0.1 : 0.05,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            overflow: "hidden",
            padding: large ? "10px 12px 0" : "6px 7px 0",
          }}
        >
          {title && (
            <p
              style={{
                margin: 0,
                marginBottom: large ? 8 : 3,
                fontSize: large ? 16 : 10.5,
                fontWeight: 600,
                color: "#5d1a17",
              }}
            >
              {title}
            </p>
          )}
          {preview ? (
            <span style={{ display: "block" }}>{preview}</span>
          ) : (
            <span style={{ opacity: 0.5 }}>
              {large ? "An empty page…" : "…"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
