"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "magic" | "password" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("password");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const supabase = createClient();

      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) setErrorMsg(error.message);
        else setSent(true);
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSent(true);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setErrorMsg(error.message);
        } else {
          router.push("/vault");
        }
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  const labels: Record<Mode, { title: string; button: string }> = {
    magic: { title: "Sign in with magic link", button: "Send magic link" },
    password: { title: "Sign in", button: "Sign in" },
    signup: { title: "Create account", button: "Create account" },
  };

  return (
    <main className="flex-1 flex items-center justify-center px-6">
      <div className="max-w-sm w-full space-y-8 text-center">
        <div>
          <div className="text-5xl mb-4">✉️</div>
          <h1 className="text-2xl font-semibold text-stone-800">
            {labels[mode].title}
          </h1>
          <p className="text-sm text-stone-500 mt-2">
            {mode === "magic"
              ? "We'll send you a magic link to open your vault."
              : mode === "signup"
                ? "Create an account to start receiving letters."
                : "Enter your credentials to open your vault."}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
            {mode === "signup"
              ? "Account created! Check your inbox to confirm your email."
              : "Check your inbox — a magic link is on its way."}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 transition"
            />
            {mode !== "magic" && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 transition"
              />
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 transition disabled:opacity-50"
            >
              {loading ? "Please wait..." : labels[mode].button}
            </button>
          </form>
        )}

        <div className="flex flex-col gap-2 text-sm text-stone-500">
          {mode !== "password" && (
            <button
              onClick={() => { setMode("password"); setErrorMsg(""); setSent(false); }}
              className="hover:text-stone-700 transition underline underline-offset-4"
            >
              Sign in with password
            </button>
          )}
          {mode !== "signup" && (
            <button
              onClick={() => { setMode("signup"); setErrorMsg(""); setSent(false); }}
              className="hover:text-stone-700 transition underline underline-offset-4"
            >
              Create an account
            </button>
          )}
          {mode !== "magic" && (
            <button
              onClick={() => { setMode("magic"); setErrorMsg(""); setSent(false); }}
              className="hover:text-stone-700 transition underline underline-offset-4"
            >
              Use magic link instead
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
