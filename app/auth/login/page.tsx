"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/BrandLogo";

type Mode = "password" | "signup" | "magic";

const TESTIMONIALS = [
  {
    quote:
      "Love Letters is the digital equivalent of that shoebox under the bed\u2014the one filled with letters you can\u2019t bear to throw away. It turns a temporary message into a permanent keepsake.",
    name: "Jane",
  },
  {
    quote:
      "Every letter I write here feels intentional. There\u2019s something about choosing the paper, the ink, the seal\u2014it makes every word matter more.",
    name: "Marcus",
  },
  {
    quote:
      "In a world of disappearing messages, this is where the words stay. Folded, sealed, and waiting to be opened again.",
    name: "Amara",
  },
  {
    quote:
      "Some desks hold clutter; mine holds courage\u2014the kind it takes to say the tender thing out loud, even when only paper hears it.",
    name: "Sofia",
  },
];

/** Seconds — scales gently with quote length for the handwriting reveal */
function handwritingSeconds(quote: string): number {
  return Math.min(5.4, Math.max(2.6, quote.length * 0.036));
}

const SLIDE_DURATION = 0.42;

function safeRedirectPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/vault";
  return raw;
}

export default function LoginPage() {
  const router = useRouter();
  const [redirectAfterAuth, setRedirectAfterAuth] = useState("/vault");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("password");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [testiIdx, setTestiIdx] = useState(0);
  const reduceMotion = useReducedMotion();
  const prefersReducedMotion = reduceMotion ?? false;

  const goToTesti = useCallback((idx: number) => {
    setTestiIdx(idx);
  }, []);

  const dwellMs = useMemo(() => {
    const q = TESTIMONIALS[testiIdx]?.quote ?? "";
    const writeSec = prefersReducedMotion ? 0.35 : handwritingSeconds(q);
    const pauseReadSec = 6;
    const slideBufferSec = SLIDE_DURATION * 2 + 0.15;
    return Math.round((writeSec + pauseReadSec + slideBufferSec) * 1000);
  }, [testiIdx, prefersReducedMotion]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestiIdx((i) => (i + 1) % TESTIMONIALS.length);
    }, dwellMs);
    return () => clearInterval(timer);
  }, [dwellMs]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirectAfterAuth(safeRedirectPath(params.get("redirect_to")));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const supabase = createClient();

      const cbUrl = `${window.location.origin}/auth/callback?redirect_to=${encodeURIComponent(redirectAfterAuth)}`;

      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: cbUrl,
          },
        });
        if (error) setErrorMsg(error.message);
        else setSent(true);
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: cbUrl,
          },
        });
        if (error) setErrorMsg(error.message);
        else setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) setErrorMsg(error.message);
        else router.push(redirectAfterAuth);
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode(to: Mode) {
    setMode(to);
    setErrorMsg("");
    setSent(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "row", width: "100vw", height: "100vh", overflow: "hidden", position: "fixed", top: 0, left: 0, zIndex: 50 }}>
      {/* ── Dashed seam between the two panels ── */}
      <div className="split-seam hidden lg:block" aria-hidden="true" />

      {/* ────────── LEFT PANEL ────────── */}
      <div style={{ width: "50%", height: "100%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#faf6f1", padding: "48px 64px", overflowY: "auto" }} className="login-left-panel">
        <div className="w-full max-w-[420px] auth-fade-1">

          {/* Title */}
          <h1 className="mb-3 font-normal">
            <BrandLogo size="lg" className="max-w-full" />
          </h1>

          {/* Subcopy */}
          <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[#6b5d4f] leading-[1.6] mb-10 max-w-[340px]">
            Your heart&apos;s private journal, preserved in vellum.
          </p>

          {/* Error */}
          {errorMsg && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700 font-[family-name:var(--font-dm-sans)]">
              {errorMsg}
            </div>
          )}

          {/* Sent confirmation */}
          {sent ? (
            <div className="auth-fade-2">
              <div className="px-5 py-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <p className="font-[family-name:var(--font-dm-sans)] text-[15px] text-[#2a1f0f] leading-relaxed">
                  {mode === "signup"
                    ? "Your folio has been registered. Check your email for the confirmation link."
                    : "A magic link has been sent. Check your email to sign in."}
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-4 font-[family-name:var(--font-dm-sans)] text-[13px] text-[#6b1f1f] hover:underline"
                >
                  ← Try again
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 auth-fade-2">

              {/* Email field */}
              <div className="login-field-group">
                <label className="login-field-label">
                  Email
                </label>
                <div className="login-field-wrap">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="youridentifier@mail.com"
                    required
                    autoComplete="email"
                    className="login-field-input"
                  />
                  <div className="login-field-icon">
                    {/* Mail icon (hicon filled style) */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6Z" fill="#8B7355" opacity="0.15"/>
                      <path d="M2 6L12 13L22 6" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="2" y="4" width="20" height="16" rx="2" stroke="#8B7355" strokeWidth="1.8"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password field */}
              {mode !== "magic" && (
                <div className="login-field-group">
                  <label className="login-field-label">
                    Your Key
                  </label>
                  <div className="login-field-wrap">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="**************"
                      required
                      minLength={6}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      className="login-field-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="login-field-icon cursor-pointer hover:opacity-70 transition-opacity"
                      tabIndex={-1}
                    >
                      {/* Lock icon (hicon filled style) */}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="11" width="18" height="10" rx="2" fill="#8B7355" opacity="0.15"/>
                        <rect x="3" y="11" width="18" height="10" rx="2" stroke="#8B7355" strokeWidth="1.8"/>
                        <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
                        <circle cx="12" cy="16" r="1.5" fill="#8B7355"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="login-cta-btn auth-fade-3"
              >
                <span>
                  {loading
                    ? "Please wait\u2026"
                    : mode === "signup"
                    ? "Create Journal"
                    : mode === "magic"
                    ? "Send Magic Link"
                    : "Start Writing"}
                </span>
                {!loading && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="ml-2">
                    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>

              {/* Footer links */}
              <div className="flex items-center justify-between pt-1 auth-fade-4">
                {mode === "password" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => switchMode("magic")}
                      className="login-footer-link"
                    >
                      Lost the key?
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode("signup")}
                      className="login-footer-link login-footer-link-accent"
                    >
                      Start a new journal
                    </button>
                  </>
                ) : mode === "signup" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => switchMode("magic")}
                      className="login-footer-link"
                    >
                      Use magic link
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode("password")}
                      className="login-footer-link login-footer-link-accent"
                    >
                      Already have a key?
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => switchMode("password")}
                      className="login-footer-link"
                    >
                      Sign in with key
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode("signup")}
                      className="login-footer-link login-footer-link-accent"
                    >
                      Start a new journal
                    </button>
                  </>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ────────── RIGHT PANEL ────────── */}
      <div style={{ width: "50%", height: "100%", flexShrink: 0, position: "relative", overflow: "hidden" }} className="login-right-panel">
        <div className="absolute inset-0 notebook-paper" />
        <div className="absolute inset-0 notebook-rules" />
        <div className="absolute inset-0 notebook-grain" />

        {/* Stamps — tight 2×2 grid; SVGs render at native aspect ratio */}
        <div className="absolute top-12 right-12 grid grid-cols-2 gap-3 z-10 items-end">
          <div className="postage-stamp" style={{ transform: "rotate(-3deg)" }}>
            <Image src="/stamps/egypt.svg" alt="" width={146} height={146} className="postage-stamp-img" />
          </div>
          <div className="postage-stamp" style={{ transform: "rotate(2deg)" }}>
            <Image src="/stamps/liberty.svg" alt="" width={120} height={146} className="postage-stamp-img" />
          </div>
          <div className="postage-stamp" style={{ transform: "rotate(4deg)" }}>
            <Image src="/stamps/big-ben.svg" alt="" width={122} height={146} className="postage-stamp-img" />
          </div>
          <div className="postage-stamp" style={{ transform: "rotate(-2deg)" }}>
            <Image src="/stamps/eiffel.svg" alt="" width={146} height={145} className="postage-stamp-img" />
          </div>
        </div>

        {/* Heart-arrow flourish */}
        <div className="absolute top-[10%] left-[22%] z-[5]">
          <svg width="200" height="260" viewBox="0 0 300 385" fill="none" className="opacity-50">
            <path d="M11.2819 369.33C23.904 303.579 53.8139 233.621 102.998 186.503C116.372 173.691 181.231 111.037 200.553 139.54C209.808 153.191 192.863 161.137 181.896 162.336C160.309 164.694 142.99 164.636 121.864 157.364C89.2555 146.138 45.4412 122.044 54.4862 81.2581C58.3898 63.6556 83.1017 55.4108 98.2999 56.0674C113.201 56.7112 126.2 61.6885 140.187 66.2925C151.555 70.0346 149.391 70.3398 148.086 58.4006C144.812 28.4337 171.464 -12.2444 201.23 17.8642C217.931 34.7571 222.945 55.8544 229.068 77.6428C231.369 85.8271 235.785 99.7707 234.612 108.276C233.335 117.537 224.313 110.266 222.802 104.161C219.043 88.9826 221.535 79.6488 234.581 70.8047C246.38 62.8063 268.254 61.3694 278.099 74.2866C283.561 81.4532 284.209 78.3543 282.927 71.0133C281.933 65.3181 275.347 49.4346 278.591 54.22C279.734 55.906 289.102 69.926 288.113 72.0087C284.592 79.423 276.682 84.8776 271.823 91.2265" stroke="#6B3A1B" strokeWidth="6.56" strokeLinecap="round" />
          </svg>
        </div>

        {/* Testimonial — slides between cards; quote uses a handwriting-style reveal */}
        <div className="absolute top-[36%] left-1/2 -translate-x-1/2 w-[min(92vw,340px)] max-w-[340px] z-10 px-2">
          <div className="relative overflow-hidden min-h-[168px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={testiIdx}
                initial={{ x: 52, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -52, opacity: 0 }}
                transition={{
                  duration: SLIDE_DURATION,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                <motion.p
                  className="handwritten-quote"
                  initial={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { clipPath: "inset(0 100% 0 0)" }
                  }
                  animate={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : { clipPath: "inset(0 0% 0 0)" }
                  }
                  transition={
                    prefersReducedMotion
                      ? { duration: 0.35, ease: "easeOut" }
                      : {
                          duration: handwritingSeconds(TESTIMONIALS[testiIdx].quote),
                          ease: [0.22, 1, 0.36, 1],
                          delay: 0.06,
                        }
                  }
                >
                  &ldquo;{TESTIMONIALS[testiIdx].quote}&rdquo;
                </motion.p>
                <motion.p
                  className="handwritten-quote-attr"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: prefersReducedMotion ? 0.35 : 0.55,
                    ease: [0.22, 1, 0.36, 1],
                    delay: prefersReducedMotion
                      ? 0.15
                      : handwritingSeconds(TESTIMONIALS[testiIdx].quote) * 0.72 +
                        0.12,
                  }}
                >
                  {TESTIMONIALS[testiIdx].name} ~
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex gap-2 mt-5 justify-center">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToTesti(i)}
                aria-label={`Show testimonial ${i + 1}`}
                className="w-[6px] h-[6px] rounded-full cursor-pointer transition-all duration-300"
                style={{
                  background: i === testiIdx ? "#5a3a2a" : "rgba(90,58,42,0.3)",
                  transform: i === testiIdx ? "scale(1.3)" : "scale(1)",
                  border: "none",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom-left polaroid cluster — single SVG (multiply blends flat white into paper) */}
        <div className="absolute bottom-[5%] left-[4%] z-[8] w-[min(92%,380px)] max-w-[380px] pointer-events-none select-none">
          <Image
            src="/photos/bottom-left-corner.svg"
            alt=""
            width={383}
            height={347}
            className="corner-photo-cluster-img"
            draggable={false}
          />
        </div>

        {/* Lipstick kiss mark */}
        <div
          className="absolute z-[6] pointer-events-none select-none"
          style={{ bottom: "26%", right: "-3%", transform: "rotate(-12deg)", opacity: 0.55 }}
        >
          <Image
            src="/stamps/lips.svg"
            alt=""
            width={220}
            height={220}
            className="object-contain"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
