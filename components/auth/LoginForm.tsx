"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, Tick02Icon } from "@hugeicons/core-free-icons";

import { getBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

/** Validates the `next` param is a safe in-app path (no open redirect). */
function safeNext(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/library";
}

export default function LoginForm() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const addr = email.trim();
    if (!addr) return;

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("Sign-in isn't configured yet. Add Supabase keys to .env.");
      return;
    }

    setStatus("sending");
    setError(null);
    const emailRedirectTo = `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`;
    const { error: err } = await supabase.auth.signInWithOtp({
      email: addr,
      options: { emailRedirectTo },
    });
    if (err) {
      setError(err.message);
      setStatus("idle");
      return;
    }
    setStatus("sent");
  };

  return (
    <div className="w-full max-w-[380px]">
      <div className="mb-6 text-center">
        <h1 className="text-[22px] font-semibold text-white">Sign in to Nori</h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">
          We&apos;ll email you a magic link — no password. You&apos;ll come
          right back to what you were doing.
        </p>
      </div>

      {status === "sent" ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#E8BE3C]/20 bg-[#E8BE3C]/[0.06] px-5 py-6 text-center">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#E8BE3C]/15 text-[#E8BE3C]">
            <HugeiconsIcon icon={Tick02Icon} size={20} color="currentColor" />
          </span>
          <p className="text-[14px] font-medium text-white/90">Check your inbox</p>
          <p className="text-[12px] leading-relaxed text-white/55">
            We sent a sign-in link to{" "}
            <span className="text-white/85">{email.trim()}</span>. Open it on
            this device to continue.
          </p>
        </div>
      ) : (
        <form onSubmit={send} className="flex flex-col gap-3">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35">
              <HugeiconsIcon icon={Mail01Icon} size={16} color="currentColor" />
            </span>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-9 pr-3 text-[14px] text-white/90 placeholder:text-white/30 transition-colors duration-150 focus:border-[#E8BE3C]/50 focus:bg-white/[0.06] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending" || !email.trim()}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#E8BE3C] text-[14px] font-semibold text-[#0d0d0e] transition-[box-shadow,opacity] hover:shadow-[0_0_0_1px_#E8BE3C,0_4px_16px_rgba(232,190,60,0.25)] disabled:pointer-events-none disabled:opacity-40 motion-safe:active:scale-[0.99]"
          >
            {status === "sending" ? "Sending…" : "Send magic link"}
          </button>

          {!isSupabaseConfigured && (
            <p className="text-center text-[11px] text-white/35">
              Sign-in is unavailable until Supabase keys are configured.
            </p>
          )}
          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
