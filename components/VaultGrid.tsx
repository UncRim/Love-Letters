"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { EnvelopeView } from "./EnvelopeView";
import type { Letter } from "@/lib/constants";

interface VaultGridProps {
  letters: Letter[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

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
        <h2 className="text-xl font-medium text-stone-700 mb-2">
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
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4"
    >
      {letters.map((letter) => (
        <motion.div key={letter.id} variants={item}>
          <EnvelopeView
            title={letter.title}
            stampType={letter.stamp_type}
            flowerType={letter.flower_type}
            colorTheme={letter.color_theme}
            isOpened={letter.is_opened}
            deliveredAt={letter.delivered_at}
            onClick={() => router.push(`/letter/${letter.id}`)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
