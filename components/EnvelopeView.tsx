"use client";

import { motion } from "framer-motion";
import {
  STAMP_EMOJI,
  FLOWER_EMOJI,
  THEME_CONFIG,
  type StampType,
  type FlowerType,
  type ColorTheme,
} from "@/lib/constants";

interface EnvelopeViewProps {
  title?: string | null;
  stampType?: StampType | null;
  flowerType?: FlowerType | null;
  colorTheme: ColorTheme;
  isOpened: boolean;
  deliveredAt: string | null;
  onClick?: () => void;
}

export function EnvelopeView({
  title,
  stampType,
  flowerType,
  colorTheme,
  isOpened,
  deliveredAt,
  onClick,
}: EnvelopeViewProps) {
  const theme = THEME_CONFIG[colorTheme];
  const stamp = stampType ? STAMP_EMOJI[stampType] : "";
  const flower = flowerType ? FLOWER_EMOJI[flowerType] : "";

  const formattedDate = deliveredAt
    ? new Date(deliveredAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Just now";

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative w-full aspect-[4/3] rounded-lg overflow-hidden cursor-pointer
        shadow-md hover:shadow-xl transition-shadow
        ${theme.paper} ${theme.ink}
        border border-black/5
      `}
    >
      {/* Envelope flap */}
      <div
        className="absolute top-0 inset-x-0 h-[40%] origin-bottom"
        style={{
          background: `linear-gradient(135deg, transparent 40%, ${theme.accent}15 100%)`,
          clipPath: "polygon(0 0, 50% 60%, 100% 0)",
        }}
      />

      {/* Wax seal indicator */}
      {!isOpened && (
        <motion.div
          className="absolute top-[28%] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm"
          style={{ background: theme.accent, color: "#fff" }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          ♥
        </motion.div>
      )}

      {/* Stamp */}
      {stamp && (
        <div className="absolute top-3 right-3 text-2xl rotate-[-8deg] opacity-80">
          {stamp}
        </div>
      )}

      {/* Flower decoration */}
      {flower && (
        <div className="absolute bottom-3 left-3 text-xl opacity-70">
          {flower}
        </div>
      )}

      {/* Title & date */}
      <div className="absolute bottom-0 inset-x-0 p-4 text-center">
        <p className="text-sm font-medium truncate">
          {title || "A letter for you"}
        </p>
        <p className="text-xs opacity-50 mt-1">{formattedDate}</p>
      </div>

      {/* Opened state overlay */}
      {isOpened && (
        <div className="absolute top-3 left-3">
          <span className="text-xs opacity-40 italic">opened</span>
        </div>
      )}
    </motion.button>
  );
}
