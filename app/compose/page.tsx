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
    <main className="flex-1 py-10 px-4">
      <header className="max-w-2xl mx-auto mb-8">
        <a
          href="/vault"
          className="text-sm text-stone-500 hover:text-stone-700 transition"
        >
          &larr; Back to vault
        </a>
        <h1 className="text-2xl font-semibold text-stone-800 tracking-tight mt-4">
          Compose a letter
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Choose your stationery, write from the heart, and seal it with love.
        </p>
      </header>
      <ComposerForm userId={user.id} />
    </main>
  );
}
