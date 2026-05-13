"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FLOWER_IMAGE,
  PAGE_SEPARATOR,
  ENVELOPE_PREVIEW_BODY_MAX_CHARS,
  ENVELOPE_PREVIEW_TITLE_MAX_CHARS,
  MAX_STAMPS_PER_LETTER,
  type StampType,
  type FlowerType,
  type FontStyle,
} from "@/lib/constants";
import { stampAssetPath } from "@/lib/constants/assets";
import { FONT_CLASSNAMES } from "@/lib/fonts";

interface EnvelopeViewProps {
  title: string | null;
  date: string;
  /** Up to two postage stamps on the flap. */
  stamps: StampType[];
  flower: FlowerType | null;
  isOpened?: boolean;
  cardMode?: boolean;
  onOpen?: () => void;
  /** Letter body — rendered on the paper area of opened envelopes. */
  body?: string;
  /** Handwriting style for the paper preview. */
  fontStyle?: FontStyle;
  /**
   * Reading screen only: envelope art width in px. Defaults to 320 (full hero).
   * Use a smaller value (e.g. 228) for a sidebar layout next to the letter.
   */
  readingEnvelopeWidth?: number;
}

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

/** Top-left postage cluster on closed/opened envelope artwork (1–2 stamps). */
function EnvelopeStampCluster({
  stamps,
  large,
}: {
  stamps: StampType[];
  large: boolean;
}) {
  const list = stamps.slice(0, MAX_STAMPS_PER_LETTER);
  if (!list.length) return null;

  const singlePx = large ? 62 : 42;
  const duoPx = large ? 48 : 33;

  return (
    <div
      className="absolute flex flex-row items-start pointer-events-none transition-transform duration-300 ease-out group-hover:-translate-y-[2px]"
      style={{
        top: large ? "9%" : "8%",
        left: large ? "7%" : "6%",
        zIndex: 2,
        gap: list.length > 1 ? (large ? -4 : -3) : 0,
      }}
    >
      {list.map((s, i) => {
        const px = list.length > 1 ? duoPx : singlePx;
        return (
          <div
            key={`${s}-${i}`}
            className="relative shrink-0"
            style={{
              width: px,
              height: px,
              transform: `rotate(${i === 0 ? -7 : 6}deg)`,
              transformOrigin: "center",
              filter:
                "drop-shadow(0 1px 1px rgba(0,0,0,0.18)) drop-shadow(0 2px 4px rgba(0,0,0,0.10))",
            }}
          >
            <Image
              src={stampAssetPath(s)}
              alt=""
              fill
              sizes={`${px}px`}
              className="object-contain"
              draggable={false}
            />
          </div>
        );
      })}
    </div>
  );
}

export function EnvelopeView({
  title,
  date,
  stamps,
  flower,
  isOpened = false,
  cardMode = false,
  onOpen,
  body,
  fontStyle,
  readingEnvelopeWidth = 320,
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
            stamps={stamps}
          />
        ) : (
          <ClosedEnvelopeArt stamps={stamps} />
        )}

        {/* Caption: tighter to envelope; title larger than date */}
        <div className="mt-2 flex flex-col items-center gap-0 px-2 pt-0.5">
          <p
            className="truncate max-w-full text-[17px] leading-snug font-medium"
            style={{
              fontFamily: "var(--font-love-ya), cursive",
              color: "#5d1a17",
            }}
            title={title || "A letter for you"}
          >
            {title || "A letter for you"}
          </p>
          <p
            className="text-[11px] leading-tight mt-0.5"
            style={{
              fontFamily: "var(--font-love-ya), cursive",
              color: "#9a5a52",
            }}
          >
            {date}
          </p>
        </div>
      </motion.button>
    );
  }

  // ─────────────────────────────────────
  // Reading mode (envelope on letter detail screen).
  // The closed → opened transition uses a 3D rotateX on the closed
  // envelope so the top edge "tips back" like a real flap unsealing,
  // then the opened envelope fades up into place.
  // ─────────────────────────────────────
  const readingArtLarge = readingEnvelopeWidth >= 280;
  const readingSizes = `${Math.round(readingEnvelopeWidth)}px`;

  return (
    <div
      className="relative mx-auto"
      style={{ width: readingEnvelopeWidth, perspective: 900 }}
    >
      <AnimatePresence mode="wait">
        {flipped || isOpened ? (
          <motion.div
            key="opened"
            initial={{ opacity: 0, scale: 0.94, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.08,
            }}
          >
            <OpenedEnvelopeArt
              flower={flower}
              title={title}
              body={body}
              fontStyle={fontStyle}
              stamps={stamps}
              large={readingArtLarge}
              imageSizes={readingSizes}
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
            initial={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0, rotateX: -85, y: -6 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformOrigin: "50% 0%", transformStyle: "preserve-3d" }}
            className="group block w-full bg-transparent border-0 p-0 cursor-pointer"
          >
            <ClosedEnvelopeArt
              stamps={stamps}
              large={readingArtLarge}
              imageSizes={readingSizes}
            />
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
  stamps,
  large = false,
  imageSizes,
}: {
  stamps: StampType[];
  large?: boolean;
  /** `next/image` sizes hint; defaults from `large`. */
  imageSizes?: string;
}) {
  const sizes =
    imageSizes ?? (large ? "320px" : "(max-width: 768px) 50vw, 240px");

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
        sizes={sizes}
        priority={large}
        className="object-contain select-none"
        draggable={false}
      />

      <EnvelopeStampCluster stamps={stamps} large={large} />
    </div>
  );
}

// ─────────────────────────────────────
// Opened envelope (uses opened-blank.svg + dynamic flower overlay)
// ─────────────────────────────────────
//
// Render order (bottom → top):
//   1. base envelope SVG
//   2. optional postage stamp(s) on the flap (closed + opened)
//   3. text (clipped to VISIBLE_PAPER_CLIP), z-8
//   4. flower, z-15 (on top of text on the paper)
//   5. V-flap duplicate clipped to flap polygon, z-22 (tucks stems; flap
//      art above flower in that region only)
//
// Hover behaviour: the parent <motion.button> in cardMode adds the `group`
// class, so the children below use Tailwind `group-hover:` utilities to
// peek out of the envelope (paper rises a touch, flower rises a bit more).
function OpenedEnvelopeArt({
  flower,
  title,
  body,
  fontStyle,
  large = false,
  stamps = [],
  previewCharLimit,
  imageSizes,
}: {
  flower: FlowerType | null;
  title?: string | null;
  body?: string;
  fontStyle?: FontStyle;
  large?: boolean;
  stamps?: StampType[];
  /** Override default body preview length (`ENVELOPE_PREVIEW_BODY_MAX_CHARS`). */
  previewCharLimit?: number;
  /** `next/image` sizes for the base SVG; defaults from `large`. */
  imageSizes?: string;
}) {
  const sizes =
    imageSizes ?? (large ? "320px" : "(max-width: 768px) 50vw, 240px");
  const flowerSrc = flower ? FLOWER_IMAGE[flower] : null;

  const firstPage = (body ?? "").split(PAGE_SEPARATOR)[0]?.trim() ?? "";
  const bodyLimit = previewCharLimit ?? ENVELOPE_PREVIEW_BODY_MAX_CHARS;
  const preview =
    firstPage.length > bodyLimit
      ? `${firstPage.slice(0, bodyLimit).trimEnd()}…`
      : firstPage;

  const rawTitle = (title ?? "").trim();
  const titleDisplay =
    rawTitle.length > ENVELOPE_PREVIEW_TITLE_MAX_CHARS
      ? `${rawTitle.slice(0, ENVELOPE_PREVIEW_TITLE_MAX_CHARS).trimEnd()}…`
      : rawTitle;

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
        sizes={sizes}
        priority={large}
        className="object-contain select-none z-0"
        draggable={false}
      />

      <EnvelopeStampCluster stamps={stamps} large={large} />

      {/* 2. Text overlay clipped to the visible paper polygon ───────────
            VISIBLE_PAPER_CLIP describes the exact region of the paper
            that shows above the V-flap, so the text physically cannot
            paint on the flap — even if the body wraps past the apex.
            Lifts a touch on hover ("peeks" out of the envelope). */}
      <div
        className="absolute inset-0 z-[8] pointer-events-none transition-transform duration-300 ease-out group-hover:-translate-y-[3px]"
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
            fontSize: large ? 15.5 : 10.5,
            lineHeight: 1.38,
            letterSpacing: large ? 0.1 : 0.04,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            overflow: "hidden",
            padding: large ? "10px 12px 0" : "6px 7px 0",
          }}
        >
          {titleDisplay ? (
            <p
              style={{
                margin: 0,
                marginBottom: large ? 7 : 3,
                fontSize: large ? 17.5 : 12,
                fontWeight: 600,
                color: "#5d1a17",
              }}
            >
              {titleDisplay}
            </p>
          ) : null}
          {preview ? (
            <span style={{ display: "block" }}>{preview}</span>
          ) : (
            <span style={{ opacity: 0.5 }}>
              {large ? "An empty page…" : "…"}
            </span>
          )}
        </div>
      </div>

      {/* 4. Flower on top of text (still under the V-flap mask below). */}
      {flowerSrc && (
        <div
          className="absolute z-[15] pointer-events-none transition-transform duration-300 ease-out group-hover:-translate-y-[7px] group-hover:rotate-[-1.5deg]"
          style={FLOWER_BOX}
        >
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

      {/* 5. V-flap mask — above flower so stems/lower bouquet tuck under the flap */}
      <div
        className="absolute inset-0 z-[22] pointer-events-none"
        style={{
          clipPath: VFLAP_CLIP_PATH,
          WebkitClipPath: VFLAP_CLIP_PATH,
        }}
      >
        <Image
          src="/envelopes/opened-blank.svg"
          alt=""
          fill
          sizes={sizes}
          className="object-contain select-none"
          aria-hidden
          draggable={false}
        />
      </div>
    </div>
  );
}

/** Compose sidebar: envelope + flower only — postage is shown on the main notepad, not here. */
export function EnvelopeComposePreview({
  title,
  body,
  fontStyle,
  flower,
}: {
  title: string;
  body: string;
  fontStyle: FontStyle;
  flower: FlowerType | null;
}) {
  return (
    <div className="group relative w-full rounded-xl overflow-hidden ring-1 ring-[rgba(120,75,35,0.28)] shadow-[0_8px_28px_rgba(45,28,12,0.14)] bg-[#e8d8b4]/40">
      <div className="flex w-full items-center justify-center p-4 sm:p-[18px]">
        <div className="w-full max-w-[210px] shrink-0">
          <OpenedEnvelopeArt
            title={title || null}
            body={body}
            fontStyle={fontStyle}
            flower={flower}
            stamps={[]}
            large={false}
          />
        </div>
      </div>
    </div>
  );
}
