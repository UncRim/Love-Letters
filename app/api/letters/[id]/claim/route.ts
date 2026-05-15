import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  let body: { secret?: string };
  try {
    body = (await req.json()) as { secret?: string };
  } catch {
    body = {};
  }
  const secret = typeof body.secret === "string" ? body.secret : "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (secret.length < 1) {
    return NextResponse.json(
      { error: "Secret key required to archive this letter." },
      { status: 400 },
    );
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

  const { data: row, error: fetchErr } = await admin
    .from("letters")
    .select("id, access_key_hash, recipient_id, is_claimed")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !row) {
    return NextResponse.json({ error: "Letter not found." }, { status: 404 });
  }

  const letter = row as {
    id: string;
    access_key_hash: string | null;
    recipient_id: string | null;
    is_claimed: boolean | null;
  };

  if (letter.recipient_id !== null) {
    return NextResponse.json(
      { error: "This letter is already archived." },
      { status: 400 },
    );
  }

  const hash = letter.access_key_hash;
  if (!hash) {
    return NextResponse.json(
      { error: "This letter cannot be archived from a link." },
      { status: 400 },
    );
  }

  const valid = await bcrypt.compare(secret, hash);
  if (!valid) {
    return NextResponse.json(
      { error: "That key doesn\u2019t match this letter." },
      { status: 401 },
    );
  }

  const now = new Date().toISOString();
  const { error: upErr } = await admin
    .from("letters")
    .update({
      recipient_id: user.id,
      is_claimed: true,
      recipient_claimed_at: now,
    })
    .eq("id", id)
    .is("recipient_id", null);

  if (upErr) {
    console.error("Claim update error:", upErr);
    return NextResponse.json({ error: upErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
