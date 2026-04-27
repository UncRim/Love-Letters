import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LetterView } from "@/components/LetterView";
import type { Letter } from "@/lib/constants";
import { LetterOpener } from "./LetterOpener";

interface LetterPageProps {
  params: Promise<{ id: string }>;
}

export default async function LetterPage({ params }: LetterPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: letter } = await supabase
    .from("letters")
    .select("*")
    .eq("id", id)
    .single();

  if (!letter) {
    notFound();
  }

  const typedLetter = letter as Letter;

  if (typedLetter.recipient_id !== user.id && typedLetter.author_id !== user.id) {
    notFound();
  }

  if (!typedLetter.is_opened && typedLetter.recipient_id === user.id) {
    return <LetterOpener letter={typedLetter} />;
  }

  return (
    <main className="flex-1 py-10 px-4">
      <div className="max-w-lg mx-auto mb-6">
        <a
          href="/vault"
          className="text-sm text-stone-500 hover:text-stone-700 transition"
        >
          &larr; Back to vault
        </a>
      </div>
      <LetterView
        body={typedLetter.body}
        fontStyle={typedLetter.font_style}
        colorTheme={typedLetter.color_theme}
        deliveredAt={typedLetter.delivered_at || typedLetter.created_at}
        title={typedLetter.title ?? undefined}
      />
    </main>
  );
}
