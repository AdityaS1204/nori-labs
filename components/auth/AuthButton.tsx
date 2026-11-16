"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Nav auth control: a "Log in" link when signed out, or an account chip with a
 * "My presets" link and "Log out" when signed in. Hidden entirely when auth
 * isn't configured. Logging in returns to the current page via `?next=`.
 */
export default function AuthButton({ className }: { className?: string }) {
  const { user, loading, configured, signOut } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (!configured || loading) return null;

  if (!user) {
    const next = encodeURIComponent(pathname ?? "/library");
    return (
      <Link
        href={`/login?next=${next}`}
        className={`inline-flex items-center rounded-md px-3 py-1.5 text-[12px] font-medium tracking-[0.03em] text-white/60 no-underline transition-[color,background-color] duration-150 hover:bg-white/[0.06] hover:text-white ${className ?? ""}`}
      >
        Log in
      </Link>
    );
  }

  const label = user.email ? user.email.split("@")[0] : "Account";

  return (
    <div className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-white/70 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white"
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#E8BE3C]/20 text-[10px] font-semibold uppercase text-[#E8BE3C]">
          {label.slice(0, 1)}
        </span>
        <span className="max-w-[120px] truncate">{label}</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-1.5 w-44 rounded-xl border border-white/[0.08] bg-[#1a1a1c] p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
          >
            <Link
              href="/library?tab=mine"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-[13px] text-white/80 no-underline transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              My presets
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-[13px] text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
