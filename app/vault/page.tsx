import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoveLetterDesk } from "@/components/LoveLetterDesk";
import type { Letter } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function VaultPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  let letters: Letter[] = [];

  try {
    const { data, error } = await supabase
      .from("letters")
      .select("*")
      .eq("recipient_id", user.id)
      .eq("is_draft", false)
      .or(`delivered_at.is.null,delivered_at.lte.${new Date().toISOString()}`)
      .order("delivered_at", { ascending: false, nullsFirst: true });

    if (error) {
      console.error("Vault query error:", error.message);
    } else {
      letters = (data as Letter[]) ?? [];
    }
  } catch (e) {
    console.error("Vault query failed:", e);
  }

  return <LoveLetterDesk initialLetters={letters} userId={user.id} />;
}
