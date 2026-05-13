/**
 * Brand mark + wordmark — warm stationery palette (#5d1a17 claret, parchment, wax seal, gold accent).
 * Wordmark uses Love Ya Like A Sister (same cursive as legacy Love Letters). `stamped` adds a light pressed-ink shadow + tilt on login.
 */

type BrandLogoSize = "sm" | "desk" | "md" | "lg" | "hero";

const SIZES: Record<
  BrandLogoSize,
  { mark: number; gap: string; text: string }
> = {
  sm: {
    mark: 34,
    gap: "gap-2.5",
    text: "text-[1.05rem] sm:text-[1.2rem] tracking-wide",
  },
  /** Sticky app header — larger wordmark, still fits the bar */
  desk: {
    mark: 40,
    gap: "gap-2.5 sm:gap-3",
    text: "text-[1.38rem] sm:text-[1.58rem] tracking-wide",
  },
  md: {
    mark: 42,
    gap: "gap-3",
    text: "text-[1.85rem] sm:text-[2.1rem] tracking-wide",
  },
  lg: {
    mark: 52,
    gap: "gap-3 sm:gap-4",
    text: "text-[2.35rem] sm:text-[2.85rem] md:text-[3.1rem] tracking-wide",
  },
  /** Landing / marketing hero — larger wordmark + mark */
  hero: {
    mark: 58,
    gap: "gap-3 sm:gap-4",
    text: "text-[2.7rem] sm:text-[3.25rem] md:text-[3.65rem] tracking-wide",
  },
};

function LogoMark({ sizePx }: { sizePx: number }) {
  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden
    >
      {/* Parchment */}
      <path
        d="M8.5 17 L24 29.5 L39.5 17 V41.5 H8.5 V17Z"
        fill="#fdf6e8"
        stroke="#5d1a17"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
      {/* Inner fold shadow */}
      <path
        d="M9.5 18 L24 29.5 L38.5 18"
        stroke="rgba(93,26,23,0.12)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Triangular flap */}
      <path
        d="M8.5 17 L24 5.5 L39.5 17 L24 29.5 Z"
        fill="#f7ead2"
        stroke="#5d1a17"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
      {/* Gold edge on flap */}
      <path
        d="M10.2 16.5 L24 6.8 L37.8 16.5"
        stroke="#b8933a"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Wax seal (solid fills — no id= defs, safe for multiple logos) */}
      <circle
        cx="24"
        cy="16.2"
        r="6.4"
        fill="#7a1f2a"
        stroke="#5d1a17"
        strokeWidth="0.9"
      />
      <ellipse
        cx="21.8"
        cy="13.8"
        rx="2.2"
        ry="1.3"
        fill="rgba(255,250,240,0.35)"
      />
      {/* Heart impression */}
      <path
        d="M24 18.2c-1.1-1.35-3.4-1.1-3.4 1 0 1.35 1.55 2.55 3.4 3.6 1.85-1.05 3.4-2.25 3.4-3.6 0-2.1-2.3-2.35-3.4-1Z"
        fill="#f5e9d4"
      />
    </svg>
  );
}

interface BrandLogoProps {
  size?: BrandLogoSize;
  /** Hide the envelope mark (wordmark only). */
  mark?: boolean;
  /** Pressed-ink emphasis on login (same face as default, stronger impression). */
  wordmarkVariant?: "default" | "stamped";
  className?: string;
}

export function BrandLogo({
  size = "md",
  mark = true,
  wordmarkVariant = "default",
  className = "",
}: BrandLogoProps) {
  const cfg = SIZES[size];

  const wordClasses =
    wordmarkVariant === "stamped"
      ? `font-[family-name:var(--font-love-ya),cursive] text-[#5d1a17] leading-[1.05] ${cfg.text} -rotate-[1deg] [text-shadow:1px_2px_0_rgba(93,26,23,0.14),0_0_1px_rgba(61,40,24,0.28)]`
      : `font-[family-name:var(--font-love-ya),cursive] text-[#5d1a17] leading-[1.05] ${cfg.text}`;

  return (
    <span
      className={`inline-flex items-center ${cfg.gap} select-none ${className}`}
    >
      {mark ? <LogoMark sizePx={cfg.mark} /> : null}
      <span className={wordClasses}>Inked.</span>
    </span>
  );
}
