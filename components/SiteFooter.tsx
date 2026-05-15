import Link from "next/link";

/**
 * Site-wide footer — warm desk palette, quiet typography, one short about line.
 */
export function SiteFooter() {
  return (
    <footer
      className="relative shrink-0 border-t border-[rgba(60,40,25,0.08)] bg-[linear-gradient(180deg,rgba(253,250,244,0.65)_0%,rgba(247,241,232,0.92)_100%)] backdrop-blur-[12px]"
      aria-label="Site footer"
    >
      <div
        className="pointer-events-none mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-[rgba(184,147,58,0.28)] to-transparent desk-shell-inline"
        aria-hidden
      />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 desk-shell-inline py-10 sm:flex-row sm:items-end sm:justify-between sm:py-11 pb-[max(2.5rem,env(safe-area-inset-bottom,0px))]">
        <div className="max-w-md space-y-3">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#6b4a3a]/75"
            style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            About
          </p>
          <p
            className="text-[14px] leading-relaxed text-[#5c4438]/90"
            style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            Inked is a small desk for letters that deserve gravity—sealed,
            scheduled, and opened with intention. No feed, no noise: just paper,
            ink, and the slow pleasure of being chosen.
          </p>
        </div>

        <div className="flex flex-col gap-5 sm:items-end">
          <Link
            href="/"
            className="site-footer-mark group inline-flex items-baseline gap-1.5 text-[#5d1a17] transition-opacity hover:opacity-85"
          >
            <span
              className="text-[22px] leading-none tracking-tight"
              style={{ fontFamily: "var(--font-love-ya), cursive" }}
            >
              Inked.
            </span>
            <span
              className="h-1 w-1 rounded-full bg-[#b8933a] opacity-70 transition-transform group-hover:scale-125"
              aria-hidden
            />
          </Link>

          <nav
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[#7a5c4a]"
            style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            aria-label="Footer links"
          >
            <Link
              href="/"
              className="underline decoration-transparent underline-offset-[5px] transition-[text-decoration-color,color] hover:text-[#5d1a17] hover:decoration-[rgba(93,26,23,0.4)]"
            >
              Home
            </Link>
            <Link
              href="/auth/login"
              className="underline decoration-transparent underline-offset-[5px] transition-[text-decoration-color,color] hover:text-[#5d1a17] hover:decoration-[rgba(93,26,23,0.4)]"
            >
              Sign in
            </Link>
            <span className="text-[#a89080]/80" aria-hidden>
              ·
            </span>
            <span className="text-[#8a7268]/85">
              {new Date().getFullYear()}
            </span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
