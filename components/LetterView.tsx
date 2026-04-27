"use client";

import { useEffect, useCallback } from "react";
import { motion, useAnimate, stagger } from "framer-motion";
import { THEME_CONFIG, type ColorTheme, type FontStyle } from "@/lib/constants";
import { FONT_CLASSNAMES } from "@/lib/fonts";

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
}: LetterViewProps) {
  const theme = THEME_CONFIG[colorTheme];
  const fontCls = FONT_CLASSNAMES[fontStyle];
  const [scope, animate] = useAnimate();

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

  return (
    <div
      ref={scope}
      className={`relative max-w-lg mx-auto rounded-[2px] overflow-hidden paper-noise ${theme.paper}`}
      style={{
        minHeight: 480,
        boxShadow:
          "0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {/* Notebook lines */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: `linear-gradient(transparent 27px, ${theme.line} 28px) 0 52px / 100% 28px repeat-y`,
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

      {/* Content */}
      <div
        className={`relative z-[3] pt-7 pb-6 pr-5 ${fontCls}`}
        style={{ paddingLeft: 68 }}
      >
        {/* Date */}
        <motion.span
          className={`block text-[13px] mb-5 ${theme.ink} opacity-60`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.1 }}
        >
          {formattedDate}
        </motion.span>

        {/* Paragraphs */}
        <div className="space-y-[28px]">
          {paragraphs.map((para, i) => (
            <p
              key={`${animationKey}-${i}`}
              className={`letter-para text-[17px] leading-[1.9] opacity-0 ${theme.ink}`}
            >
              {para}
            </p>
          ))}
        </div>

        {/* Sign-off (on last page) */}
        {currentPage === totalPages - 1 && (
          <motion.p
            className={`mt-6 text-[15px] opacity-80 whitespace-pre-line ${theme.ink}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: paragraphs.length * 0.2 + 0.5 }}
          >
            {signOff}
          </motion.p>
        )}
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
    </div>
  );
}
