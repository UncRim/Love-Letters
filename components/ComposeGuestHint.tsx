"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function ComposeGuestHint() {
  const [isGuest, setIsGuest] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (!cancelled) setIsGuest(!data.session);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (isGuest !== true) return null;

  return (
    <p className="text-[12px] leading-relaxed text-[#6b4a3a] mt-2 max-w-xl font-[family-name:var(--font-dm-sans)]">
      You&apos;re composing without an account. Your sealed letters are saved in
      this browser so you can attach them after you{" "}
      <Link
        href="/auth/login?redirect_to=/vault"
        className="font-medium text-[#5d1a17] underline decoration-[rgba(93,26,23,0.35)] underline-offset-2 hover:decoration-[rgba(93,26,23,0.55)]"
      >
        sign in
      </Link>
      .
    </p>
  );
}
