import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { BrandLogo } from "@/components/BrandLogo";

export default async function HomePage() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/vault");
    }
  } catch {
    // Supabase not configured yet — show landing page
  }

  return (
    <div className="min-h-screen w-full flex relative">
      {/* ── Dashed seam between the two panels ── */}
      <div className="split-seam hidden lg:block" aria-hidden="true" />

      {/* ── Left panel ── */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col items-center justify-center bg-[#faf6f1] px-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1.25rem,env(safe-area-inset-right,0px))] py-16 pb-[max(4rem,env(safe-area-inset-bottom,0px))] lg:px-16">
        <div className="w-full max-w-[420px] auth-fade-1">
          <h1 className="mb-1.5 font-normal sm:mb-2">
            <BrandLogo size="hero" />
          </h1>

          <p className="font-[family-name:var(--font-dm-sans)] text-[15px] text-[#6b5d4f] leading-[1.7] mb-12 max-w-[360px]">
            A private desk where handwritten letters arrive sealed with care. Every word chosen, every page folded, every seal pressed by hand.
          </p>

          <a href="/auth/login" className="block w-full max-w-[360px]">
            <div className="login-cta-btn">
              <span>Open the Vault</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="ml-2">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </a>
          <a
            href="/compose"
            className="mt-4 block w-full max-w-[360px] text-center text-[14px] font-[family-name:var(--font-dm-sans)] text-[#6b4a3a] underline decoration-[rgba(107,74,58,0.35)] underline-offset-[6px] hover:text-[#5d1a17] hover:decoration-[rgba(93,26,23,0.45)]"
          >
            Compose a letter without signing in
          </a>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="hidden lg:block lg:w-1/2 min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 notebook-paper" />
        <div className="absolute inset-0 notebook-rules" />
        <div className="absolute inset-0 notebook-grain" />

        {/* Stamps — tight 2×2 grid; SVGs render at native aspect ratio */}
        <div className="absolute top-12 right-12 grid grid-cols-2 gap-3 z-10 items-end">
          <div className="postage-stamp" style={{ transform: "rotate(-3deg)" }}>
            <Image src="/stamps/valentine02-1.png" alt="" width={146} height={146} className="postage-stamp-img" />
          </div>
          <div className="postage-stamp" style={{ transform: "rotate(2deg)" }}>
            <Image src="/stamps/valentine02-2.png" alt="" width={120} height={146} className="postage-stamp-img" />
          </div>
          <div className="postage-stamp" style={{ transform: "rotate(4deg)" }}>
            <Image src="/stamps/valentine03-1.png" alt="" width={122} height={146} className="postage-stamp-img" />
          </div>
          <div className="postage-stamp" style={{ transform: "rotate(-2deg)" }}>
            <Image src="/stamps/valentine03-2.png" alt="" width={146} height={145} className="postage-stamp-img" />
          </div>
        </div>

        {/* Heart-arrow flourish */}
        <div className="absolute top-[10%] left-[22%] z-[5]">
          <svg width="200" height="260" viewBox="0 0 300 385" fill="none" className="opacity-50">
            <path d="M11.2819 369.33C23.904 303.579 53.8139 233.621 102.998 186.503C116.372 173.691 181.231 111.037 200.553 139.54C209.808 153.191 192.863 161.137 181.896 162.336C160.309 164.694 142.99 164.636 121.864 157.364C89.2555 146.138 45.4412 122.044 54.4862 81.2581C58.3898 63.6556 83.1017 55.4108 98.2999 56.0674C113.201 56.7112 126.2 61.6885 140.187 66.2925C151.555 70.0346 149.391 70.3398 148.086 58.4006C144.812 28.4337 171.464 -12.2444 201.23 17.8642C217.931 34.7571 222.945 55.8544 229.068 77.6428C231.369 85.8271 235.785 99.7707 234.612 108.276C233.335 117.537 224.313 110.266 222.802 104.161C219.043 88.9826 221.535 79.6488 234.581 70.8047C246.38 62.8063 268.254 61.3694 278.099 74.2866C283.561 81.4532 284.209 78.3543 282.927 71.0133C281.933 65.3181 275.347 49.4346 278.591 54.22C279.734 55.906 289.102 69.926 288.113 72.0087C284.592 79.423 276.682 84.8776 271.823 91.2265" stroke="#6B3A1B" strokeWidth="6.56" strokeLinecap="round" />
          </svg>
        </div>

        {/* Quote — handwritten, centered */}
        <div className="absolute top-[36%] left-1/2 -translate-x-1/2 w-[320px] z-10">
          <p className="handwritten-quote">
            &ldquo;Inked is the digital equivalent of that shoebox under the bed&mdash;the one filled with letters you can&apos;t bear to throw away. It turns a fleeting message into a permanent keepsake pressed in ink.&rdquo;
          </p>
          <p className="handwritten-quote-attr">Jane ~</p>
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
