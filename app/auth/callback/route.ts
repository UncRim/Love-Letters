import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next =
    searchParams.get("redirect_to") ??
    searchParams.get("next") ??
    "/vault";
  const origin = new URL(request.url).origin;

  const redirectTo = new URL(next, origin);

  if (!code) {
    redirectTo.pathname = "/";
    redirectTo.searchParams.set("error", "auth");
    return NextResponse.redirect(redirectTo);
  }

  const response = NextResponse.redirect(redirectTo);

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    redirectTo.pathname = "/auth/login";
    redirectTo.searchParams.set("error", "auth");
    return NextResponse.redirect(redirectTo);
  }

  return response;
}
