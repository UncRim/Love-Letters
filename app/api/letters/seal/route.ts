import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  FONT_STYLES,
  COLOR_THEMES,
  PAGE_SEPARATOR,
  STAMP_TYPES,
  MAX_STAMPS_PER_LETTER,
  type FontStyle,
  type ColorTheme,
  type StampType,
} from "@/lib/constants";
import type {
  LetterMetadataStored,
  LetterContentStored,
} from "@/lib/letter-content";

export const runtime = "nodejs";

type SealBody = {
  title?: string;
  pages?: string[];
  secretKey?: string;
  font_style?: string;
  color_theme?: string;
  /** Legacy single stamp. */
  stamp_id?: string | null;
  /** Up to `MAX_STAMPS_PER_LETTER` IDs (preferred). */
  stamp_ids?: string[] | null;
  flower_id?: string | null;
};

function parseSealStamps(body: SealBody): StampType[] | null {
  const useArray = Array.isArray(body.stamp_ids);
  const raw: string[] = useArray
    ? body.stamp_ids!.filter((x): x is string => typeof x === "string")
    : body.stamp_id != null && typeof body.stamp_id === "string"
      ? [body.stamp_id]
      : [];

  const out: StampType[] = [];
  for (const id of raw) {
    if (!(STAMP_TYPES as readonly string[]).includes(id)) return null;
    const st = id as StampType;
    if (out.includes(st)) continue;
    out.push(st);
    if (out.length >= MAX_STAMPS_PER_LETTER) break;
  }
  return out;
}

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
  const stampIdsParsed = parseSealStamps(body);
  if (stampIdsParsed === null) {
    return NextResponse.json({ error: "Invalid stamp." }, { status: 400 });
  }
  const stamp_ids = stampIdsParsed;
  const stamp_type_col = stamp_ids[0] ?? null;
  const flower_id = body.flower_id ?? null;

  if (!title || pages.every((p) => !String(p).trim())) {
    return NextResponse.json(
      { error: "Title and letter body required." },
      { status: 400 },
    );
  }
  if (secretKey.length < 4) {
    return NextResponse.json(
      { error: "Secret key must be at least 4 characters." },
      { status: 400 },
    );
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

  const normalizedPages = pages.map((p) => String(p));
  const joinedBody = normalizedPages.join(PAGE_SEPARATOR);

  const metadata: LetterMetadataStored = {
    flower_id: flower_id,
    stamp_id: stamp_type_col,
    ...(stamp_ids.length > 0 ? { stamp_ids: stamp_ids } : {}),
    theme_id: color_theme,
    font_id: font_style,
  };

  const content: LetterContentStored = {
    pages: normalizedPages,
    title,
  };

  const access_key_hash = await bcrypt.hash(secretKey, 10);

  const row = {
    recipient_id: null as string | null,
    title,
    body: joinedBody,
    content,
    metadata,
    font_style,
    color_theme,
    stamp_type: stamp_type_col,
    flower_type: flower_id,
    delivered_at: new Date().toISOString(),
    is_draft: false,
    access_key_hash,
    is_claimed: false,
  };

  if (user) {
    const { data: inserted, error } = await supabase
      .from("letters")
      .insert({
        ...row,
        author_id: user.id,
        sender_id: user.id,
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
      guest: false,
    });
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

  const { data: inserted, error } = await admin
    .from("letters")
    .insert({
      ...row,
      author_id: null,
      sender_id: null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Guest seal insert error:", error);
    return NextResponse.json(
      {
        error:
          error.message.includes("null value") && error.message.includes("author_id")
            ? "Database must allow guest letters (run migrations)."
            : error.message,
      },
      { status: 500 },
    );
  }

  const origin = new URL(req.url).origin;
  const shareUrl = `${origin}/open/${inserted.id}`;

  return NextResponse.json({
    id: inserted.id,
    shareUrl,
    guest: true,
  });
}
