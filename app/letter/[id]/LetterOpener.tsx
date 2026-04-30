"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { EnvelopeView } from "@/components/EnvelopeView";
import { LetterView } from "@/components/LetterView";
import { createClient } from "@/lib/supabase/client";
import type { Letter } from "@/lib/constants";
import {
  letterPages,
  stampIdFromLetter,
  flowerIdFromLetter,
  fontFromLetter,
  themeFromLetter,
} from "@/lib/letter-content";

interface LetterOpenerProps {
  letter: Letter;
}

export function LetterOpener({ letter }: LetterOpenerProps) {
  const router = useRouter();
  const [opened, setOpened] = useState(false);
  const [, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const pages = letterPages(letter);

  async function handleOpen() {
    const supabase = createClient();
    await supabase
      .from("letters")
      .update({ is_opened: true, opened_at: new Date().toISOString() })
      .eq("id", letter.id);

    setOpened(true);
    setTimeout(() => setAnimKey((k) => k + 1), 950);

    startTransition(() => {
      router.refresh();
    });
  }

  const formattedDate = new Date(
    letter.delivered_at || letter.created_at
  ).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <main className="flex-1 desk-canvas vault-page relative min-h-full flex flex-col">
      <div className="vault-grain pointer-events-none absolute inset-0" />
      <div className="relative flex-1 py-10 px-4">
      <div className="max-w-lg mx-auto mb-6">
        <a href="/vault" className="desk-back-link">
          ← Back to vault
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
              date={formattedDate}
              stamp={stampIdFromLetter(letter)}
              flower={flowerIdFromLetter(letter)}
              isOpened={false}
              onOpen={handleOpen}
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
              pages={pages}
              fontStyle={fontFromLetter(letter)}
              colorTheme={themeFromLetter(letter)}
              deliveredAt={letter.delivered_at || letter.created_at}
              currentPage={currentPage}
              totalPages={Math.max(1, pages.length)}
              onPageChange={(p) => {
                setCurrentPage(p);
                setAnimKey((k) => k + 1);
              }}
              animationKey={animKey}
              stamp={stampIdFromLetter(letter)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </main>
  );
}
