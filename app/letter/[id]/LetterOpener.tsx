"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { EnvelopeView } from "@/components/EnvelopeView";
import { LetterView } from "@/components/LetterView";
import { createClient } from "@/lib/supabase/client";
import type { Letter } from "@/lib/constants";

interface LetterOpenerProps {
  letter: Letter;
}

export function LetterOpener({ letter }: LetterOpenerProps) {
  const router = useRouter();
  const [opened, setOpened] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleOpen() {
    const supabase = createClient();
    await supabase
      .from("letters")
      .update({ is_opened: true, opened_at: new Date().toISOString() })
      .eq("id", letter.id);

    setOpened(true);

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <main className="flex-1 py-10 px-4">
      <div className="max-w-lg mx-auto mb-6">
        <a
          href="/vault"
          className="text-sm text-stone-500 hover:text-stone-700 transition"
        >
          &larr; Back to vault
        </a>
      </div>

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div
            key="envelope"
            className="max-w-xs mx-auto"
            exit={{ opacity: 0, scale: 0.9, rotateX: 90 }}
            transition={{ duration: 0.5 }}
          >
            <EnvelopeView
              title={letter.title}
              stampType={letter.stamp_type}
              flowerType={letter.flower_type}
              colorTheme={letter.color_theme}
              isOpened={false}
              deliveredAt={letter.delivered_at}
              onClick={handleOpen}
            />
            <p className="text-center text-sm text-stone-400 mt-4 animate-pulse">
              Tap to open
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <LetterView
              body={letter.body}
              fontStyle={letter.font_style}
              colorTheme={letter.color_theme}
              deliveredAt={letter.delivered_at || letter.created_at}
              title={letter.title ?? undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
