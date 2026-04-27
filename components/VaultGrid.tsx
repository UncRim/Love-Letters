"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { EnvelopeView } from "./EnvelopeView";
import type { Letter } from "@/lib/constants";

interface VaultGridProps {
  letters: Letter[];
}

export function VaultGrid({ letters }: VaultGridProps) {
  const router = useRouter();

  if (letters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-6xl mb-6"
        >
          💌
        </motion.div>
        <h2 className="text-xl font-[family-name:--font-playfair] italic text-stone-700 mb-2">
          No letters yet
        </h2>
        <p className="text-stone-500 text-sm max-w-xs">
          When a letter arrives, it will appear here sealed with love.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.06 } },
      }}
      className="grid gap-4 p-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))" }}
    >
      {letters.map((letter) => (
        <motion.div
          key={letter.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <EnvelopeView
            title={letter.title}
            date={new Date(
              letter.delivered_at || letter.created_at
            ).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
            stamp={letter.stamp_type}
            flower={letter.flower_type}
            isOpened={letter.is_opened}
            cardMode
            onOpen={() => router.push(`/letter/${letter.id}`)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
