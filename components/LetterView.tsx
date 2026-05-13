"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import Image from "next/image";
import { motion, useAnimate, stagger } from "framer-motion";
import {
  THEME_CONFIG,
  MAX_STAMPS_PER_LETTER,
  type ColorTheme,
  type FontStyle,
  type StampType,
} from "@/lib/constants";
import { stampSrcFromId } from "@/lib/constants/assets";
import { FONT_CLASSNAMES } from "@/lib/fonts";

/** Matches `linear-gradient(...) 0 FIRST_LINE_OFFSET / 100% LINE_STEP repeat-y` on the ruled layer. */
const RULE_FIRST_OFFSET_PX = 52;
const RULE_LINE_STEP_PX = 28;

function PaperCornerFold({
  paperHex,
  dark,
}: {
  paperHex: string;
  dark: boolean;
}) {
  const shade = dark ? "rgba(0,0,0,0.38)" : "rgba(40,28,18,0.1)";
  return (
    <div
      className="pointer-events-none absolute z-[5] bottom-0 right-0 h-11 w-11 sm:h-12 sm:w-12"
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
          background: `
            linear-gradient(to top left, ${shade} 0%, transparent 52%),
            linear-gradient(
              225deg,
              color-mix(in srgb, ${paperHex} 72%, black) 0%,
              ${paperHex} 56%,
              color-mix(in srgb, ${paperHex} 94%, white) 100%
            )
          `,
          boxShadow: dark
            ? "-2px 2px 5px rgba(0,0,0,0.45), inset 1px -1px 0 rgba(255,255,255,0.06)"
            : "-3px 3px 8px rgba(40,28,18,0.14), inset 1px -1px 0 rgba(255,255,255,0.35)",
        }}
      />
    </div>
  );
}

interface LetterViewProps {
  pages: string[];
  fontStyle: FontStyle;
  colorTheme: ColorTheme;
  deliveredAt: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  animationKey?: string | number;
  signOff?: string;
  /** Wider paper for reading layout (hero letter vs. compact cards). */
  widePaper?: boolean;
  /** Postage on the sheet (up to two); omitted when empty. */
  stamps?: StampType[] | null;
  /** Extra actions below pagination (e.g. Save to Vault). */
  footerSlot?: ReactNode;
}

export function LetterView({
  pages,
  fontStyle,
  colorTheme,
  deliveredAt,
  currentPage,
  totalPages,
  onPageChange,
  animationKey,
  signOff = "With all of me,\nD.",
  widePaper = false,
  stamps = null,
  footerSlot = null,
}: LetterViewProps) {
  const theme = THEME_CONFIG[colorTheme];
  const fontCls = FONT_CLASSNAMES[fontStyle];
  const [scope, animate] = useAnimate();
  const stampList = (stamps ?? [])
    .filter((s): s is StampType => Boolean(s))
    .slice(0, MAX_STAMPS_PER_LETTER);

  const formattedDate = new Date(deliveredAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const runAnimation = useCallback(() => {
    animate(
      ".letter-para",
      { opacity: [0, 1], y: [6, 0] },
      {
        duration: 0.5,
        delay: stagger(0.2, { startDelay: 0.2 }),
        ease: "easeOut",
      }
    );
  }, [animate]);

  useEffect(() => {
    runAnimation();
  }, [runAnimation, animationKey]);

  const pageContent = pages[currentPage] ?? "";
  const paragraphs = pageContent.split("\n\n").filter(Boolean);

  const lineHeightPx = `${RULE_LINE_STEP_PX}px`;
  /** Nudge text so baselines sit between horizontal rules (center of each 28px band). */
  const contentPadTop =
    RULE_FIRST_OFFSET_PX +
    RULE_LINE_STEP_PX / 2 -
    RULE_LINE_STEP_PX * 0.72 +
    (stampList.length === 0 ? 0 : stampList.length > 1 ? 14 : 10);

  return (
    <div
      ref={scope}
      className={`relative mx-auto rounded-[2px] overflow-hidden paper-noise ${theme.paper} flex flex-col ${
        widePaper ? "w-full max-w-3xl" : "max-w-lg"
      }`}
      style={{
        minHeight: widePaper ? 520 : 480,
        boxShadow:
          "0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div className="relative flex-1 min-h-[min(100%,432px)] sm:min-h-[456px]">
        {/* Notebook lines */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            background: `linear-gradient(transparent 27px, ${theme.line} 28px) 0 ${RULE_FIRST_OFFSET_PX}px / 100% ${RULE_LINE_STEP_PX}px repeat-y`,
          }}
        />

        {/* Red margin line */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-[1]"
          style={{ left: 54, width: 1, background: theme.margin }}
        />

        {/* Hole punches */}
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

        {stampList.length > 0 ? (
          <div
            className="absolute z-[4] top-5 right-3 sm:top-6 sm:right-5 flex flex-row flex-wrap items-center justify-center gap-1.5 min-w-[118px] sm:min-w-[128px] min-h-[96px] sm:min-h-[104px] rounded-[6px] pointer-events-none px-2 py-2.5"
            style={{
              border: `1.5px dashed ${
                colorTheme === "midnight"
                  ? "rgba(255,255,255,0.38)"
                  : "rgba(90,62,40,0.42)"
              }`,
              background:
                colorTheme === "midnight"
                  ? "rgba(0,0,0,0.14)"
                  : "rgba(255,253,248,0.5)",
            }}
          >
            {stampList.map((s, i) => (
              <div
                key={`${s}-${i}`}
                className="relative w-[46px] h-[46px] sm:w-[52px] sm:h-[52px]"
                style={{
                  transform: `rotate(${i === 0 ? -8 : 6}deg)`,
                }}
              >
                <Image
                  src={stampSrcFromId(s)}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="52px"
                />
              </div>
            ))}
          </div>
        ) : null}

        {/* Dog-ear fold — bottom-right of the writing sheet only */}
        <PaperCornerFold paperHex={theme.paperHex} dark={colorTheme === "midnight"} />

        {/* Content — line-height = rule step keeps each wrapped line between rules */}
        <div
          className={`relative z-[3] pb-6 pr-5 ${fontCls}`}
          style={{
            paddingLeft: 68,
            paddingTop: contentPadTop,
            lineHeight: lineHeightPx,
          }}
        >
          {/* Date */}
          <motion.span
            className={`block text-[16px] sm:text-[17px] mb-0 ${theme.ink} opacity-[0.62]`}
            style={{ lineHeight: lineHeightPx }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.62 }}
            transition={{ delay: 0.1 }}
          >
            {formattedDate}
          </motion.span>

          {/* One ruled gap after the date */}
          <div aria-hidden className="h-[28px] shrink-0" />

          {/* Paragraphs */}
          <div
            className="space-y-[28px]"
            style={{ lineHeight: lineHeightPx }}
          >
            {paragraphs.map((para, i) => (
              <p
                key={`${animationKey}-${i}`}
                className={`letter-para text-[20px] sm:text-[22px] opacity-0 ${theme.ink}`}
                style={{
                  lineHeight: lineHeightPx,
                  paddingTop: "3px",
                }}
              >
                {para}
              </p>
            ))}
          </div>

          {/* Sign-off (on last page) */}
          {currentPage === totalPages - 1 && (
            <motion.p
              className={`mt-[28px] text-[18px] sm:text-[19px] opacity-[0.85] whitespace-pre-line ${theme.ink}`}
              style={{ lineHeight: lineHeightPx, paddingTop: "3px" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ delay: paragraphs.length * 0.2 + 0.5 }}
            >
              {signOff}
            </motion.p>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between px-5 py-[10px]"
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
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-3 py-[5px] rounded-[14px] border-[0.5px] border-stone-300 text-[12px] text-stone-500 disabled:opacity-30 cursor-pointer hover:bg-stone-100 transition-colors"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-[5px]">
            {Array.from({ length: totalPages }).map((_, i) => (
              <div
                key={i}
                onClick={() => onPageChange(i)}
                className="w-[5px] h-[5px] rounded-full cursor-pointer transition-colors"
                style={{
                  background:
                    i === currentPage ? "#b8933a" : "rgba(0,0,0,0.18)",
                }}
              />
            ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="px-3 py-[5px] rounded-[14px] border-[0.5px] border-stone-300 text-[12px] text-stone-500 disabled:opacity-30 cursor-pointer hover:bg-stone-100 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {footerSlot ? (
        <div className="px-5 pb-5" style={{ paddingLeft: 68 }}>
          {footerSlot}
        </div>
      ) : null}
    </div>
  );
}
