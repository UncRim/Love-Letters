import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ComposerForm } from "@/components/ComposerForm";

export default async function ComposePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <main className="flex-1 desk-canvas vault-page relative min-h-full">
      <div className="vault-grain pointer-events-none absolute inset-0" />
      <div className="relative py-10 px-4">
      <header className="max-w-2xl mx-auto mb-8">
        <a href="/vault" className="desk-back-link">
          ← Back to vault
        </a>
        <h1 className="vault-subtitle text-[clamp(22px,3vw,28px)] mt-4 leading-tight">
          Compose a letter
        </h1>
        <p className="text-[13px] text-[#5d1a17]/55 mt-1.5 max-w-xl">
          Choose your stationery, write from the heart, and seal it with love.
        </p>
      </header>
      <ComposerForm />
      </div>
    </main>
  );
}
