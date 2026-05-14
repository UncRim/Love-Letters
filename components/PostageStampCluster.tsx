"use client";

import Image from "next/image";
import { MAX_STAMPS_PER_LETTER, type StampType } from "@/lib/constants";
import { stampAssetPath } from "@/lib/constants/assets";

function hash32(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Stable per-stamp jitter so layouts feel hand-placed but don’t shift on re-render. */
function handJitter(stampId: string, index: number) {
  const h = hash32(`${stampId}:${index}`);
  return {
    rot: ((h % 9) - 4) * 0.55,
    tx: ((h >> 4) % 7) - 3,
    ty: ((h >> 8) % 7) - 3,
  };
}

const SHEET_BASE = {
  rotate: [-9, 6, -5] as const,
  overlap: [0, -26, -22] as const,
  yNudge: [0, 6, -5] as const,
  scale: [1, 0.96, 1.04] as const,
  z: [1, 3, 2] as const,
};

const ENVELOPE_BASE = {
  rotate: [-8, 7, -5] as const,
  overlap: [0, -22, -18] as const,
  yNudge: [0, 5, -4] as const,
  scale: [1, 0.95, 1.02] as const,
  z: [1, 3, 2] as const,
};

export function PostageStampCluster({
  stamps,
  variant,
  large = false,
  emptyLabel,
  emptyLabelClassName,
}: {
  stamps: StampType[];
  variant: "sheet" | "envelope";
  large?: boolean;
  /** Shown when there are no stamps (compose preview only). */
  emptyLabel?: string;
  /** Tailwind classes for `emptyLabel` (e.g. midnight theme). */
  emptyLabelClassName?: string;
}) {
  const list = stamps.slice(0, MAX_STAMPS_PER_LETTER);

  if (list.length === 0) {
    if (!emptyLabel) return null;
    return (
      <div
        className={`pointer-events-none absolute z-[4] flex items-start justify-end ${
          variant === "sheet"
            ? "top-6 right-6 sm:top-8 sm:right-9"
            : ""
        }`}
        style={
          variant === "envelope"
            ? {
                top: large ? "7.25%" : "6.25%",
                right: large ? "7%" : "6%",
                left: "auto",
                zIndex: 2,
              }
            : undefined
        }
      >
        <span
          className={`max-w-[100px] text-center text-[8px] uppercase leading-tight tracking-[0.12em] opacity-45 ${
            emptyLabelClassName ??
            (variant === "sheet" ? "text-stone-500" : "text-stone-600")
          } ${variant === "envelope" ? "drop-shadow-sm" : ""}`}
        >
          {emptyLabel}
        </span>
      </div>
    );
  }

  const base = variant === "sheet" ? SHEET_BASE : ENVELOPE_BASE;

  const envelopePx = (i: number) => {
    const trio = large ? [76, 65, 70] : [52, 45, 48];
    const duo = large ? [74, 65] : [50, 43];
    const single = large ? 86 : 58;
    if (list.length === 1) return single;
    if (list.length === 2) return duo[i] ?? duo[0];
    return trio[i] ?? trio[0];
  };

  return (
    <div
      className={`pointer-events-none flex flex-row items-start justify-end transition-transform duration-300 ease-out group-hover:-translate-y-[2px] ${
        variant === "sheet"
          ? "absolute z-[4] top-6 right-6 sm:top-8 sm:right-9"
          : "absolute"
      }`}
      style={
        variant === "envelope"
          ? {
              top: large ? "7.25%" : "6.25%",
              right: large ? "7%" : "6%",
              left: "auto",
              zIndex: 2,
            }
          : undefined
      }
    >
      {list.map((s, i) => {
        const { rot, tx, ty } = handJitter(s, i);
        const br = base.rotate[i] ?? base.rotate[base.rotate.length - 1];
        const ov = base.overlap[i] ?? -20;
        const yn = base.yNudge[i] ?? 0;
        const sc = base.scale[i] ?? 1;
        const zi = base.z[i] ?? 1;
        const deg = br + rot;
        const envPx = envelopePx(i);

        return (
          <div
            key={`${s}-${i}`}
            className={
              variant === "sheet"
                ? "relative shrink-0 h-[60px] w-[60px] sm:h-[80px] sm:w-[80px]"
                : "relative shrink-0"
            }
            style={{
              ...(variant === "envelope"
                ? { width: envPx, height: envPx }
                : {}),
              marginLeft: i === 0 ? 0 : ov,
              marginTop: yn,
              zIndex: zi,
              transform: `translate(${tx}px, ${ty}px) rotate(${deg}deg) scale(${sc})`,
              transformOrigin: "center center",
              filter:
                "drop-shadow(0 1px 1px rgba(0,0,0,0.16)) drop-shadow(0 2px 5px rgba(0,0,0,0.1))",
            }}
          >
            <Image
              src={stampAssetPath(s)}
              alt=""
              fill
              sizes={
                variant === "sheet"
                  ? "(max-width: 640px) 60px, 80px"
                  : `${envPx}px`
              }
              className="object-contain"
              draggable={false}
            />
          </div>
        );
      })}
    </div>
  );
}
