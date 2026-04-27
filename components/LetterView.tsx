"use client";

import { useEffect } from "react";
import { motion, useAnimate, stagger } from "framer-motion";
import { THEME_CONFIG, type ColorTheme, type FontStyle } from "@/lib/constants";
import { FONT_CLASSNAMES } from "@/lib/fonts";

interface LetterViewProps {
  body: string;
  fontStyle: FontStyle;
  colorTheme: ColorTheme;
  deliveredAt: string;
  title?: string;
  signOff?: string;
}

export function LetterView({
  body,
  fontStyle,
  colorTheme,
  deliveredAt,
  signOff = "With all of me,\nD.",
}: LetterViewProps) {
  const theme = THEME_CONFIG[colorTheme];
  const fontCls = FONT_CLASSNAMES[fontStyle];
  const [scope, animate] = useAnimate();

  const paragraphs = body.split("\n\n").filter(Boolean);

  useEffect(() => {
    animate(
      ".letter-para",
      { opacity: [0, 1], y: [8, 0] },
      { duration: 0.5, delay: stagger(0.18, { startDelay: 0.3 }) }
    );
  }, [animate]);

  const formattedDate = new Date(deliveredAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      ref={scope}
      className={`
        relative max-w-lg mx-auto rounded-sm overflow-hidden
        shadow-[0_4px_24px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.06)]
        ${theme.paper}
      `}
      style={{ minHeight: "520px" }}
    >
      {/* Notebook lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(transparent 27px, ${theme.line} 28px) 0 48px / 100% 28px repeat-y`,
        }}
      />

      {/* Margin line */}
      <div
        className="absolute top-0 bottom-0 left-14 w-px pointer-events-none"
        style={{ background: theme.margin }}
      />

      {/* Hole punches */}
      <div className="absolute top-12 bottom-0 left-[22px] flex flex-col gap-24 pt-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3.5 h-3.5 rounded-full bg-stone-100 border border-stone-200/60"
          />
        ))}
      </div>

      {/* Letter content */}
      <div
        className={`relative z-10 px-8 pt-9 pb-10 pl-[72px] ${theme.ink} ${fontCls}`}
      >
        <motion.span
          className="block text-sm mb-6 opacity-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.1 }}
        >
          {formattedDate}
        </motion.span>

        <div className="text-[17px] leading-[1.9] space-y-[28px]">
          {paragraphs.map((para, i) => (
            <p key={i} className="letter-para opacity-0">
              {para}
            </p>
          ))}
        </div>

        <motion.p
          className="mt-8 text-base opacity-80 whitespace-pre-line"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: paragraphs.length * 0.18 + 0.6 }}
        >
          {signOff}
        </motion.p>
      </div>
    </div>
  );
}
