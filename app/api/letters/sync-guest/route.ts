import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MAX_IDS = 64;

function uniqueUuids(ids: unknown): string[] {
  const re =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!Array.isArray(ids)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const x of ids) {
    if (typeof x !== "string" || !re.test(x)) continue;
    if (seen.has(x)) continue;
    seen.add(x);
    out.push(x);
    if (out.length >= MAX_IDS) break;
  }
  return out;
}

/**
 * Links guest-sealed letters (author_id IS NULL) to the signed-in user.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const letterIds = uniqueUuids(
    (body as { letterIds?: unknown })?.letterIds,
  );
  if (letterIds.length === 0) {
    return NextResponse.json({ synced: 0, ids: [] });
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Server misconfigured." },
      { status: 500 },
    );
  }

  const synced: string[] = [];

  for (const id of letterIds) {
    const { data: row, error: selErr } = await admin
      .from("letters")
      .select("id, author_id")
      .eq("id", id)
      .maybeSingle();

    if (selErr || !row) continue;

    const r = row as { id: string; author_id: string | null };
    if (r.author_id !== null) continue;

    const { error: upErr } = await admin
      .from("letters")
      .update({
        author_id: user.id,
        sender_id: user.id,
      })
      .eq("id", id)
      .is("author_id", null);

    if (!upErr) synced.push(id);
  }

  return NextResponse.json({ synced: synced.length, ids: synced });
}
