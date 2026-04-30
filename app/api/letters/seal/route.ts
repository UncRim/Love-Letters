import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@/lib/supabase/server";
import {
  FONT_STYLES,
  COLOR_THEMES,
  PAGE_SEPARATOR,
  type FontStyle,
  type ColorTheme,
} from "@/lib/constants";
import type { LetterMetadataStored, LetterContentStored } from "@/lib/letter-content";

export const runtime = "nodejs";

type SealBody = {
  title?: string;
  pages?: string[];
  secretKey?: string;
  font_style?: string;
  color_theme?: string;
  stamp_id?: string | null;
  flower_id?: string | null;
};

export async function POST(req: Request) {
  let body: SealBody;
  try {
    body = (await req.json()) as SealBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  const pages = Array.isArray(body.pages) ? body.pages : [];
  const secretKey = body.secretKey ?? "";
  const font_style = body.font_style as FontStyle | undefined;
  const color_theme = body.color_theme as ColorTheme | undefined;
  const stamp_id = body.stamp_id ?? null;
  const flower_id = body.flower_id ?? null;

  if (!title || pages.every((p) => !String(p).trim())) {
    return NextResponse.json({ error: "Title and letter body required." }, { status: 400 });
  }
  if (secretKey.length < 4) {
    return NextResponse.json({ error: "Secret key must be at least 4 characters." }, { status: 400 });
  }
  if (!font_style || !FONT_STYLES.includes(font_style)) {
    return NextResponse.json({ error: "Invalid font." }, { status: 400 });
  }
  if (!color_theme || !COLOR_THEMES.includes(color_theme)) {
    return NextResponse.json({ error: "Invalid theme." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const normalizedPages = pages.map((p) => String(p));
  const joinedBody = normalizedPages.join(PAGE_SEPARATOR);

  const metadata: LetterMetadataStored = {
    flower_id: flower_id,
    stamp_id: stamp_id,
    theme_id: color_theme,
    font_id: font_style,
  };

  const content: LetterContentStored = {
    pages: normalizedPages,
    title,
  };

  const access_key_hash = await bcrypt.hash(secretKey, 10);

  const { data: inserted, error } = await supabase
    .from("letters")
    .insert({
      author_id: user.id,
      sender_id: user.id,
      recipient_id: null,
      title,
      body: joinedBody,
      content,
      metadata,
      font_style,
      color_theme,
      stamp_type: stamp_id,
      flower_type: flower_id,
      delivered_at: new Date().toISOString(),
      is_draft: false,
      access_key_hash,
      is_claimed: false,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Seal insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const origin = new URL(req.url).origin;
  const shareUrl = `${origin}/open/${inserted.id}`;

  return NextResponse.json({
    id: inserted.id,
    shareUrl,
  });
}
