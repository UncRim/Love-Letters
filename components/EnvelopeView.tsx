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

// Flower position inside the opened envelope SVG (326×346 viewBox).
//
// The bouquet sits on the right side of the envelope. Its head should peek
// up over the V-flap apex (around y ≈ 44%) while its stems slide down behind
// the flap. We give it enough vertical range so the entire bouquet PNG fits
// at a natural size without being squashed.
const FLOWER_BOX = {
  left: "54%", //  envelope x ≈ 176
  top: "16%", //   envelope y ≈ 55  (a hair below the envelope's top edge)
  width: "38%", //  right edge ≈ envelope x = 92%  (snug against right edge)
  height: "62%", //  bottom    ≈ envelope y = 78%  (just past V-flap base)
};

// V-flap polygon (the front face of the envelope) in viewBox %.
// We render a second copy of the envelope SVG clipped to JUST this polygon
// and layer it ABOVE the flower. That way the bottom half of the bouquet
// gets visually covered by the flap, making it look like the flower is
// tucked inside the envelope rather than glued on top of it.
//
// Vertices traced from the V-flap path in opened-blank.svg:
//   (24.42, 265) (147.38, 161.59) (158.71, 153.77)
//   (167.01, 153.77) (178.34, 161.59) (301.30, 265)
const VFLAP_CLIP_PATH =
  "polygon(7.49% 76.59%, 45.21% 46.7%, 48.68% 44.44%, 51.23% 44.44%, 54.71% 46.7%, 92.43% 76.59%)";

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

// Letter-paper rectangle inside opened-blank.svg (326×346 viewBox).
// Derived from the white paper path corners (paper is tilted ~5° clockwise):
//   top-left  ≈ ( 89.14,   2.31)
//   top-right ≈ (247.82,  16.19)
//   bot-right ≈ (250.48, 200.79)
//   bot-left  ≈ ( 71.50, 203.94)
// The bottom of the paper is hidden behind the V-shaped envelope flap
// (V-apex at ~y=153.77 ≈ 44.4%). Our text overlay must therefore stay
// inside the band y≈12 → y≈140 so it never bleeds onto the V-flap face.
//
// We also use NO rotation on the overlay itself: the slight 5° paper tilt
// is barely perceptible at thumbnail size, and rotating the overlay was
// pushing the bottom corners across the V-flap apex (where text would
// then read on top of the flap, looking duplicated/messy).
const PAPER_BOX = {
  centerLeft: `${(167 / 326) * 100}%`, //   51.23%
  centerTop: `${(74 / 346) * 100}%`, //     21.39%
  width: `${(132 / 326) * 100}%`, //        40.49%
  height: `${(108 / 346) * 100}%`, //       31.21%   (bottom ≈ y=128, above V-flap apex)
  rotation: 0,
};

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
  // Card mode shows a much shorter preview because the visible paper above
  // the V-flap is small; long bodies would wrap past the box and bleed onto
  // the flap itself.
  const firstPage = (body ?? "").split(PAGE_SEPARATOR)[0]?.trim() ?? "";
  const previewLimit = large ? 320 : 75;
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
      <Image
        src="/envelopes/opened-blank.svg"
        alt="Opened envelope with letter"
        fill
        sizes={large ? "320px" : "(max-width: 768px) 50vw, 240px"}
        priority={large}
        className="object-contain select-none"
        draggable={false}
      />

      {/* Letter text overlay — sits directly on the SVG paper (no extra
          card / background) so the text reads as if it were handwritten on
          the same sheet of paper drawn in opened-blank.svg. */}
      <div
        className={`absolute pointer-events-none overflow-hidden ${fontClassName}`}
        style={{
          left: PAPER_BOX.centerLeft,
          top: PAPER_BOX.centerTop,
          width: PAPER_BOX.width,
          height: PAPER_BOX.height,
          transform: `translate(-50%, -50%) rotate(${PAPER_BOX.rotation}deg)`,
          transformOrigin: "center",
        }}
      >
        <div
          style={{
            padding: large ? "14px 12px 10px" : "8px 7px 6px",
            color: "#2a1c12",
            fontSize: large ? 14 : 8.5,
            lineHeight: 1.4,
            letterSpacing: large ? 0.1 : 0.05,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          {title && (
            <p
              style={{
                margin: 0,
                marginBottom: large ? 8 : 4,
                fontSize: large ? 16 : 10,
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

      {/* Dynamic flower bouquet — rendered between the envelope back/paper
          and the V-flap so it appears tucked INSIDE the envelope. The
          actual "tucking" is done by the V-flap layer below, which is a
          duplicate of the envelope SVG clipped to just the V-flap polygon
          and stacked on top of the flower. */}
      {flowerSrc && (
        <div
          className="absolute pointer-events-none"
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

      {/* V-flap-only overlay: a second copy of the envelope SVG clipped to
          just the V-flap polygon. Layered on TOP of the flower so the lower
          half of the bouquet is hidden behind the flap, preserving the
          illusion that the flower sits inside the envelope. */}
      {flowerSrc && (
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
      )}
    </div>
  );
}
