import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Letter } from "@/lib/constants";
import {
  letterPages,
  stampsFromLetter,
  fontFromLetter,
  themeFromLetter,
} from "@/lib/letter-content";
import { LetterOpener } from "./LetterOpener";
import { LetterReader } from "./LetterReader";

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

  if (
    typedLetter.recipient_id !== user.id &&
    typedLetter.author_id !== user.id
  ) {
    notFound();
  }

  if (
    typedLetter.recipient_id &&
    !typedLetter.is_opened &&
    typedLetter.recipient_id === user.id
  ) {
    return <LetterOpener letter={typedLetter} />;
  }

  const pages = letterPages(typedLetter);

  return (
    <main className="flex-1 desk-canvas vault-page relative min-h-full flex flex-col">
      <div className="vault-grain pointer-events-none absolute inset-0" />
      <div className="relative flex-1 py-10 px-4">
      <div className="max-w-lg mx-auto mb-6">
        <a
          href="/vault"
          className="desk-back-link"
        >
          ← Back to vault
        </a>
      </div>
      <LetterReader
        pages={pages}
        fontStyle={fontFromLetter(typedLetter)}
        colorTheme={themeFromLetter(typedLetter)}
        deliveredAt={typedLetter.delivered_at || typedLetter.created_at}
        stamps={stampsFromLetter(typedLetter)}
      />
      </div>
    </main>
  );
}
