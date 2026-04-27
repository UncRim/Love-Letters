"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlowerIcon } from "./FlowerIcon";
import {
  STAMP_EMOJI,
  type StampType,
  type FlowerType,
} from "@/lib/constants";

interface EnvelopeViewProps {
  title: string | null;
  date: string;
  stamp: StampType | null;
  flower: FlowerType | null;
  isOpened?: boolean;
  cardMode?: boolean;
  onOpen?: () => void;
}

export function EnvelopeView({
  title,
  date,
  stamp,
  flower,
  isOpened = false,
  cardMode = false,
  onOpen,
}: EnvelopeViewProps) {
  const [flipped, setFlipped] = useState(false);
  const stampEmoji = stamp ? STAMP_EMOJI[stamp] : "";

  const handleClick = () => {
    if (cardMode) {
      onOpen?.();
      return;
    }
    setFlipped(true);
    setTimeout(() => onOpen?.(), 750);
  };

  if (cardMode) {
    return (
      <motion.div
        className="relative cursor-pointer"
        style={{ height: 155 }}
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={handleClick}
      >
        <div
          className="absolute inset-0 rounded-sm overflow-hidden"
          style={{
            background: "#f0e0c0",
            boxShadow:
              "0 3px 14px rgba(0,0,0,0.13), 0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          {/* Side fold triangles */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(0 0, 48% 50%, 0 100%)",
              background: "#e8d8b0",
              zIndex: 1,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(100% 0, 52% 50%, 100% 100%)",
              background: "#e8d8b0",
              zIndex: 1,
            }}
          />
          {/* Bottom fold */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(0 100%, 50% 52%, 100% 100%)",
              background: "#dcc8a0",
              zIndex: 1,
            }}
          />
          {/* Flap shadow */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              background: "#c8b47a",
              zIndex: 2,
              height: "54%",
            }}
          />
          {/* Flap face */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              background: "#ddc890",
              zIndex: 3,
              height: "54%",
              transformOrigin: "top center",
            }}
          />

          {/* Stamp */}
          {stampEmoji && (
            <div
              className="absolute flex flex-col items-center justify-center"
              style={{
                top: 9,
                right: 9,
                width: 30,
                height: 36,
                background: "#f5e8c8",
                border: "1.5px solid #b8933a",
                zIndex: 20,
                fontSize: 14,
              }}
            >
              <span>{stampEmoji}</span>
            </div>
          )}

          {/* Flower seal */}
          {flower && (
            <div
              className="absolute"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-42%)",
                zIndex: 15,
              }}
            >
              <FlowerIcon type={flower} size={28} />
            </div>
          )}

          {/* Unread dot */}
          {!isOpened && (
            <div
              className="absolute"
              style={{
                top: 9,
                left: 9,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#c0392b",
                zIndex: 20,
              }}
            />
          )}

          {/* Title & date */}
          <div
            className="absolute"
            style={{ bottom: 11, left: 11, right: 46, zIndex: 20 }}
          >
            <p
              className="font-[family-name:--font-playfair] italic"
              style={{
                fontSize: 11.5,
                color: "#5a3e28",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title || "A letter for you"}
              {!isOpened && (
                <span
                  style={{
                    fontSize: 8,
                    color: "#b8933a",
                    border: "0.5px solid #b8933a",
                    padding: "1px 4px",
                    borderRadius: 2,
                    marginLeft: 4,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    verticalAlign: "middle",
                  }}
                >
                  new
                </span>
              )}
            </p>
            <p
              style={{
                fontSize: 9,
                color: "#9a7a5a",
                letterSpacing: "0.03em",
                margin: "2px 0 0",
              }}
            >
              {date}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Full reading-mode envelope
  return (
    <div className="relative mx-auto" style={{ width: 320, height: 200 }}>
      <div
        className="absolute inset-0 rounded-sm overflow-hidden"
        style={{
          background: "#f0e0c0",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        {/* Side folds */}
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
        {/* Bottom fold */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: "polygon(0 100%, 50% 52%, 100% 100%)",
            background: "#dcc8a0",
          }}
        />
        {/* Flap shadow behind */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: "polygon(0 0, 100% 0, 50% 52%)",
            background: "#c8b47a",
            zIndex: 2,
          }}
        />

        {/* Animated flap */}
        <motion.div
          className="absolute inset-0"
          style={{
            clipPath: "polygon(0 0, 100% 0, 50% 52%)",
            background: "#ddc890",
            transformOrigin: "top center",
            zIndex: 8,
          }}
          animate={{ rotateX: flipped ? -180 : 0 }}
          transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
        />

        {/* Letter peeking out after flap opens */}
        <AnimatePresence>
          {flipped && (
            <motion.div
              className="absolute rounded-sm overflow-hidden"
              style={{
                bottom: 10,
                left: 18,
                right: 18,
                background: "#fdf6e3",
                zIndex: 10,
                boxShadow: "0 2px 10px rgba(0,0,0,0.14)",
              }}
              initial={{ height: 0, bottom: 10 }}
              animate={{ height: 160, bottom: "calc(100% - 28px)" }}
              transition={{
                duration: 0.65,
                delay: 0.3,
                ease: [0.4, 0, 0.2, 1],
              }}
            />
          )}
        </AnimatePresence>

        {/* Stamp */}
        {stampEmoji && (
          <div
            className="absolute flex flex-col items-center justify-center gap-0.5"
            style={{
              top: 12,
              right: 12,
              width: 38,
              height: 46,
              background: "#f5e8c8",
              border: "1.5px solid #b8933a",
              zIndex: 20,
              fontSize: 18,
            }}
          >
            <span>{stampEmoji}</span>
            <span
              style={{
                fontSize: 5.5,
                color: "#b8933a",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              Love
            </span>
          </div>
        )}

        {/* Flower */}
        {flower && (
          <div
            className="absolute"
            style={{ bottom: 14, left: 14, zIndex: 20 }}
          >
            <FlowerIcon type={flower} size={30} />
          </div>
        )}

        {/* Wax seal (disappears on open) */}
        <motion.div
          className="absolute flex items-center justify-center font-[family-name:--font-playfair] italic"
          style={{
            top: "50%",
            left: "50%",
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#b83030",
            color: "rgba(255,255,255,0.85)",
            fontSize: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.22)",
            zIndex: 25,
          }}
          animate={{
            x: "-50%",
            y: "-50%",
            opacity: flipped ? 0 : 1,
            scale: flipped ? 0 : 1,
          }}
          transition={{ duration: 0.35 }}
        >
          ❧
        </motion.div>
      </div>

      {/* Click target */}
      {!flipped && (
        <div
          className="absolute inset-0 cursor-pointer z-30"
          onClick={handleClick}
        />
      )}
    </div>
  );
}
