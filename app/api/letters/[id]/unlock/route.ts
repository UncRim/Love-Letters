import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Letter } from "@/lib/constants";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  let body: { secret?: string };
  try {
    body = (await req.json()) as { secret?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const secret = body.secret ?? "";
  if (secret.length < 1) {
    return NextResponse.json({ error: "Secret required." }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server misconfigured." }, { status: 500 });
  }

  const { data: letter, error } = await admin
    .from("letters")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !letter) {
    return NextResponse.json({ error: "Letter not found." }, { status: 404 });
  }

  const typed = letter as Letter;
  const hash = typed.access_key_hash;
  if (!hash) {
    return NextResponse.json({ error: "This letter does not require a secret." }, { status: 400 });
  }

  const valid = await bcrypt.compare(secret, hash);
  if (!valid) {
    return NextResponse.json({ error: "That key doesn\u2019t match." }, { status: 401 });
  }

  const { access_key_hash: _, ...rest } = typed;

  return NextResponse.json({
    letter: rest as Omit<Letter, "access_key_hash">,
  });
}
