import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

const TESTIMONIALS = [
  "Love Letters is the digital equivalent of that shoebox under the bed.",
  "Every word chosen, every page folded, every seal pressed by hand.",
  "In a world of disappearing messages, this is where the words stay.",
  "Some words can only be written by hand. The pen knows what the keyboard forgets.",
  "The weight of paper, the smell of ink\u2014this is how love was always meant to travel.",
  "In a world of notifications, a sealed letter is a revolution.",
];

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

  const marqueeItems = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div className="min-h-screen w-full flex">
      {/* ── Left panel ── */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col items-center justify-center bg-[#faf6f1] px-6 py-16 lg:px-16">
        <div className="w-full max-w-[420px] text-center auth-fade-1">
          <h1 className="font-[family-name:var(--font-love-ya)] text-[48px] md:text-[56px] text-[#2a1f0f] leading-[1.1] mb-4">
            Love Letters
          </h1>

          <p className="font-[family-name:var(--font-dm-sans)] text-[15px] text-[#6b5d4f] leading-[1.7] mb-12 max-w-[360px] mx-auto">
            A private desk where handwritten letters arrive sealed with care. Every word chosen, every page folded, every seal pressed by hand.
          </p>

          <a href="/auth/login" className="inline-block w-full max-w-[320px]">
            <div className="login-cta-btn">
              <span className="font-[family-name:var(--font-dm-sans)] text-[14px] font-medium tracking-wide">
                Open the Vault
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="ml-2">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </a>

          {/* Marquee */}
          <div className="mt-14 auth-fade-3">
            <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(90,60,20,0.15), transparent)" }} />
            <div
              className="overflow-hidden py-4 relative"
              style={{
                maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
                WebkitMaskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
              }}
            >
              <div className="marquee-track flex gap-12 whitespace-nowrap">
                {marqueeItems.map((quote, i) => (
                  <span
                    key={i}
                    className="font-[family-name:var(--font-dm-sans)] italic text-[12px] text-[#8a7a6a] shrink-0 inline-flex items-center gap-12"
                  >
                    {quote}
                    <span className="text-[9px] text-[rgba(80,50,15,0.2)] not-italic">✦</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(90,60,20,0.15), transparent)" }} />
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="hidden lg:block lg:w-1/2 min-h-screen relative overflow-hidden bg-[#c8a96e]">
        <div className="absolute inset-0 corkboard-texture" />
        <div className="absolute inset-0 corkboard-grain" />

        {/* Stamps */}
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

        {/* Handwritten love flourish */}
        <div className="absolute top-[8%] left-[18%] z-[5]">
          <svg width="220" height="280" viewBox="0 0 300 385" fill="none" className="opacity-70">
            <path d="M11.2819 369.33C23.904 303.579 53.8139 233.621 102.998 186.503C116.372 173.691 181.231 111.037 200.553 139.54C209.808 153.191 192.863 161.137 181.896 162.336C160.309 164.694 142.99 164.636 121.864 157.364C89.2555 146.138 45.4412 122.044 54.4862 81.2581C58.3898 63.6556 83.1017 55.4108 98.2999 56.0674C113.201 56.7112 126.2 61.6885 140.187 66.2925C151.555 70.0346 149.391 70.3398 148.086 58.4006C144.812 28.4337 171.464 -12.2444 201.23 17.8642C217.931 34.7571 222.945 55.8544 229.068 77.6428C231.369 85.8271 235.785 99.7707 234.612 108.276C233.335 117.537 224.313 110.266 222.802 104.161C219.043 88.9826 221.535 79.6488 234.581 70.8047C246.38 62.8063 268.254 61.3694 278.099 74.2866C283.561 81.4532 284.209 78.3543 282.927 71.0133C281.933 65.3181 275.347 49.4346 278.591 54.22C279.734 55.906 289.102 69.926 288.113 72.0087C284.592 79.423 276.682 84.8776 271.823 91.2265" stroke="#6B1B1B" strokeOpacity="0.3" strokeWidth="6.56" strokeLinecap="round" />
          </svg>
        </div>

        {/* Quote */}
        <div className="absolute top-[34%] right-[8%] w-[260px] z-10">
          <p className="font-[family-name:var(--font-dm-sans)] italic text-[14px] leading-[1.75] text-[#3a2a1a]">
            &ldquo;Love Letters is the digital equivalent of that shoebox under the bed&mdash;the one filled with letters you can&apos;t bear to throw away.&rdquo;
          </p>
          <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#5a4a3a] mt-3">Jane ~</p>
        </div>

        {/* Photos */}
        <div className="photo-frame absolute z-[8]" style={{ top: "52%", left: "8%", transform: "rotate(-6deg)" }}>
          <Image src="/photos/couple-1.png" alt="Couple" width={140} height={140} className="photo-frame-img" />
        </div>
        <div className="photo-frame absolute z-[8]" style={{ top: "48%", left: "30%", transform: "rotate(3deg)" }}>
          <Image src="/photos/couple-2.png" alt="Couple" width={140} height={140} className="photo-frame-img" />
        </div>
        <div className="photo-frame absolute z-[8]" style={{ top: "58%", left: "52%", transform: "rotate(-4deg)" }}>
          <Image src="/photos/couple-3.png" alt="Couple" width={140} height={140} className="photo-frame-img" />
        </div>
        <div className="photo-frame absolute z-[9]" style={{ top: "44%", left: "18%", transform: "rotate(5deg)" }}>
          <Image src="/photos/couple-4.png" alt="Couple" width={140} height={140} className="photo-frame-img" />
        </div>

        {/* Pins */}
        <div className="absolute z-[12] w-3 h-3 rounded-full" style={{ top: "54%", left: "22%", background: "#9b59b6", boxShadow: "0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)" }} />
        <div className="absolute z-[12] w-3 h-3 rounded-full" style={{ top: "50%", left: "48%", background: "#27ae60", boxShadow: "0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)" }} />
        <div className="absolute z-[12] w-3 h-3 rounded-full" style={{ top: "68%", left: "36%", background: "#e74c3c", boxShadow: "0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)" }} />

        {/* Kiss mark */}
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
