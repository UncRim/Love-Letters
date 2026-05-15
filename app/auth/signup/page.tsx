import { redirect } from "next/navigation";

function safeRedirectPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/vault";
  return raw;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ claim?: string; redirect_to?: string }>;
}) {
  const p = await searchParams;
  const q = new URLSearchParams();
  q.set("mode", "signup");
  if (p.claim) q.set("claim", p.claim);
  q.set("redirect_to", safeRedirectPath(p.redirect_to ?? null));
  redirect(`/auth/login?${q.toString()}`);
}
