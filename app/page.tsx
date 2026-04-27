import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
    <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md space-y-8">
        <div className="text-6xl">💌</div>
        <h1 className="text-3xl font-semibold text-stone-800 tracking-tight">
          Love Letters
        </h1>
        <p className="text-stone-500 leading-relaxed">
          A private desk where handwritten letters arrive sealed with care.
          Sign in to open your vault.
        </p>
        <a
          href="/auth/login"
          className="inline-block px-8 py-3 rounded-lg bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 transition shadow-sm"
        >
          Sign in
        </a>
      </div>
    </main>
  );
}
