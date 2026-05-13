"use client";

import { useState } from "react";
import { LetterView } from "@/components/LetterView";
import type { FontStyle, ColorTheme, StampType } from "@/lib/constants";

interface LetterReaderProps {
  pages: string[];
  fontStyle: FontStyle;
  colorTheme: ColorTheme;
  deliveredAt: string;
  stamps?: StampType[];
}

export function LetterReader({
  pages,
  fontStyle,
  colorTheme,
  deliveredAt,
  stamps = [],
}: LetterReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  return (
    <LetterView
      pages={pages}
      fontStyle={fontStyle}
      colorTheme={colorTheme}
      deliveredAt={deliveredAt}
      currentPage={currentPage}
      totalPages={pages.length}
      onPageChange={(p) => {
        setCurrentPage(p);
        setAnimKey((k) => k + 1);
      }}
      animationKey={animKey}
      stamps={stamps}
    />
  );
}
