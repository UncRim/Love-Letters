"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

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
];

const PHOTOS = [
  { src: "/photos/couple-1.png", rotate: -6, top: "52%", left: "8%" },
  { src: "/photos/couple-2.png", rotate: 3, top: "48%", left: "30%" },
  { src: "/photos/couple-3.png", rotate: -4, top: "58%", left: "52%" },
  { src: "/photos/couple-4.png", rotate: 5, top: "44%", left: "18%" },
];

const PINS = [
  { color: "#9b59b6", top: "54%", left: "22%" },
  { color: "#27ae60", top: "50%", left: "48%" },
  { color: "#e74c3c", top: "68%", left: "36%" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("password");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [testiIdx, setTestiIdx] = useState(0);
  const [testiFading, setTestiFading] = useState(false);

  const goToTesti = useCallback((idx: number) => {
    setTestiFading(true);
    setTimeout(() => {
      setTestiIdx(idx);
      setTestiFading(false);
    }, 400);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      goToTesti((testiIdx + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testiIdx, goToTesti]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const supabase = createClient();

      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) setErrorMsg(error.message);
        else setSent(true);
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
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
        else router.push("/vault");
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
      {/* ────────── LEFT PANEL ────────── */}
      <div style={{ width: "50%", height: "100%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#faf6f1", padding: "48px 64px", overflowY: "auto" }} className="login-left-panel">
        <div className="w-full max-w-[420px] auth-fade-1">

          {/* Title */}
          <h1 className="font-[family-name:var(--font-love-ya)] text-[42px] md:text-[52px] text-[#2a1f0f] leading-[1.1] mb-3">
            Love Letters
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
                <span className="font-[family-name:var(--font-dm-sans)] text-[14px] font-medium tracking-wide">
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
      <div style={{ width: "50%", height: "100%", flexShrink: 0, position: "relative", overflow: "hidden", background: "#c8a96e" }} className="login-right-panel">
        {/* Corkboard texture overlay */}
        <div className="absolute inset-0 corkboard-texture" />
        <div className="absolute inset-0 corkboard-grain" />

        {/* ── Postage stamps (top-right cluster) ── */}
        <div className="absolute top-8 right-8 flex flex-wrap gap-3 w-[260px] justify-end z-10">
          <div className="postage-stamp" style={{ transform: "rotate(-3deg)" }}>
            <Image src="/stamps/egypt.svg" alt="Egypt" width={110} height={130} className="postage-stamp-img" />
            <span className="postage-stamp-label" style={{ color: "#c0392b" }}>EGYPT</span>
          </div>
          <div className="postage-stamp" style={{ transform: "rotate(2deg)" }}>
            <Image src="/stamps/liberty.svg" alt="New York" width={110} height={130} className="postage-stamp-img" />
            <span className="postage-stamp-label" style={{ color: "#2c3e50" }}>NEW YORK</span>
          </div>
          <div className="postage-stamp" style={{ transform: "rotate(4deg)" }}>
            <Image src="/stamps/big-ben.svg" alt="London" width={110} height={130} className="postage-stamp-img" />
            <span className="postage-stamp-label" style={{ color: "#8e44ad" }}>ENGLAND</span>
          </div>
          <div className="postage-stamp" style={{ transform: "rotate(-2deg)" }}>
            <Image src="/stamps/eiffel.svg" alt="France" width={110} height={130} className="postage-stamp-img" />
            <span className="postage-stamp-label" style={{ color: "#2980b9" }}>FRANCE</span>
          </div>
        </div>

        {/* ── Handwritten love flourish ── */}
        <div className="absolute top-[8%] left-[18%] z-[5]">
          <svg width="220" height="280" viewBox="0 0 300 385" fill="none" className="opacity-70">
            <path d="M11.2819 369.33C23.904 303.579 53.8139 233.621 102.998 186.503C116.372 173.691 181.231 111.037 200.553 139.54C209.808 153.191 192.863 161.137 181.896 162.336C160.309 164.694 142.99 164.636 121.864 157.364C89.2555 146.138 45.4412 122.044 54.4862 81.2581C58.3898 63.6556 83.1017 55.4108 98.2999 56.0674C113.201 56.7112 126.2 61.6885 140.187 66.2925C151.555 70.0346 149.391 70.3398 148.086 58.4006C144.812 28.4337 171.464 -12.2444 201.23 17.8642C217.931 34.7571 222.945 55.8544 229.068 77.6428C231.369 85.8271 235.785 99.7707 234.612 108.276C233.335 117.537 224.313 110.266 222.802 104.161C219.043 88.9826 221.535 79.6488 234.581 70.8047C246.38 62.8063 268.254 61.3694 278.099 74.2866C283.561 81.4532 284.209 78.3543 282.927 71.0133C281.933 65.3181 275.347 49.4346 278.591 54.22C279.734 55.906 289.102 69.926 288.113 72.0087C284.592 79.423 276.682 84.8776 271.823 91.2265" stroke="#6B1B1B" strokeOpacity="0.3" strokeWidth="6.56" strokeLinecap="round" />
          </svg>
        </div>

        {/* ── Testimonial quote ── */}
        <div className="absolute top-[30%] right-[8%] w-[280px] z-10">
          <div
            className="transition-all duration-500"
            style={{
              opacity: testiFading ? 0 : 1,
              transform: testiFading ? "translateY(6px)" : "translateY(0)",
            }}
          >
            <p className="font-[family-name:var(--font-dm-sans)] italic text-[14px] leading-[1.75] text-[#3a2a1a] mb-3">
              &ldquo;{TESTIMONIALS[testiIdx].quote}&rdquo;
            </p>
            <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#5a4a3a]">
              {TESTIMONIALS[testiIdx].name} ~
            </p>
          </div>
          {/* Dots */}
          <div className="flex gap-2 mt-4">
            {TESTIMONIALS.map((_, i) => (
              <div
                key={i}
                onClick={() => goToTesti(i)}
                className="w-[6px] h-[6px] rounded-full cursor-pointer transition-all duration-300"
                style={{
                  background: i === testiIdx ? "#5a3a2a" : "rgba(90,58,42,0.3)",
                  transform: i === testiIdx ? "scale(1.3)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Scattered photos ── */}
        {PHOTOS.map((photo, i) => (
          <div
            key={i}
            className="photo-frame absolute z-[8]"
            style={{
              top: photo.top,
              left: photo.left,
              transform: `rotate(${photo.rotate}deg)`,
            }}
          >
            <Image
              src={photo.src}
              alt={`Couple ${i + 1}`}
              width={140}
              height={140}
              className="photo-frame-img"
            />
          </div>
        ))}

        {/* ── Push pins ── */}
        {PINS.map((pin, i) => (
          <div
            key={i}
            className="absolute z-[12] w-3 h-3 rounded-full shadow-md"
            style={{
              top: pin.top,
              left: pin.left,
              background: pin.color,
              boxShadow: `0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)`,
            }}
          />
        ))}

        {/* ── Lips / kiss mark ── */}
        <div className="absolute bottom-[4%] right-[4%] z-[6] opacity-40">
          <Image
            src="/stamps/lips.svg"
            alt="Kiss mark"
            width={200}
            height={200}
            className="object-contain"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
