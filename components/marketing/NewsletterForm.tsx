"use client";

import { useState } from "react";

import Squircle from "@/components/ui/Squircle";
import { RADIUS } from "@/components/ui/radius";
import { FOOTER } from "@/lib/landing-content";

/**
 * The launch-list signup. Presentational for the design study: it validates and
 * acknowledges locally but is wired to no service, so no address leaves the
 * page. Point `onSubmit` at a real endpoint to make it live.
 */
export default function NewsletterForm() {
  const { title, placeholder, cta } = FOOTER.newsletter;
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <form
      className="flex w-full max-w-[320px] flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (email) setDone(true);
      }}
    >
      <p className="m-0 text-[12.5px] font-medium text-ink/80">{title}</p>

      <Squircle cornerRadius={RADIUS.control}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setDone(false);
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full border border-ink/15 bg-ink/[0.04] px-4 py-2.5 text-[13px] text-ink placeholder:text-ink/40 focus:border-ink/40 focus:outline-none"
        />
      </Squircle>

      <Squircle cornerRadius={RADIUS.control}>
        <button
          type="submit"
          className="w-full bg-lime px-4 py-2.5 text-[13px] font-medium text-ink transition-[filter,transform] duration-150 hover:brightness-105 motion-safe:active:scale-[0.98]"
        >
          {cta}
        </button>
      </Squircle>

      <p className="m-0 min-h-[1.1em] text-[11px] text-ink/50" aria-live="polite">
        {done ? "Thanks — we'll be in touch at launch." : " "}
      </p>
    </form>
  );
}
