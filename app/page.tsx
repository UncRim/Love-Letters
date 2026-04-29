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
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col items-center justify-center bg-[#faf6f1] px-6 py-16 lg:px-16">
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

        {/* Quote — handwritten, centered */}
        <div className="absolute top-[36%] left-1/2 -translate-x-1/2 w-[320px] z-10">
          <p className="handwritten-quote">
            &ldquo;Love Letters is the digital equivalent of that shoebox under the bed&mdash;the one filled with letters you can&apos;t bear to throw away. It turns a temporary message into a permanent keepsake.&rdquo;
          </p>
          <p className="handwritten-quote-attr">Jane ~</p>
        </div>

        {/* Photo cluster — SVG polaroids (frame + tilt + shadow are baked in;
            CSS rotation here compensates for the built-in 17.85° tilt to spread angles). */}
        <div className="absolute bottom-[10%] left-[12%] w-[420px] h-[260px] z-[8]">
          <div className="photo-card" style={{ top: "10%", left: "0%",  transform: "rotate(-25deg)" }}>
            <Image src="/photos/couple-1.svg" alt="" width={210} height={196} className="photo-card-img" />
          </div>
          <div className="photo-card" style={{ top: "0%",  left: "30%", transform: "rotate(-14deg)" }}>
            <Image src="/photos/couple-2.svg" alt="" width={210} height={196} className="photo-card-img" />
          </div>
          <div className="photo-card" style={{ top: "32%", left: "55%", transform: "rotate(-21deg)" }}>
            <Image src="/photos/couple-3.svg" alt="" width={210} height={196} className="photo-card-img" />
          </div>
          <div className="photo-card" style={{ top: "44%", left: "20%", transform: "rotate(-12deg)" }}>
            <Image src="/photos/couple-4.svg" alt="" width={210} height={196} className="photo-card-img" />
          </div>

          {/* Pushpins on the photos */}
          <div className="pushpin z-[12]" style={{ top: "8%",  left: "32%", background: "#9b59b6" }} />
          <div className="pushpin z-[12]" style={{ top: "34%", left: "62%", background: "#27ae60" }} />
          <div className="pushpin z-[12]" style={{ top: "84%", left: "16%", background: "#e74c3c" }} />
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
