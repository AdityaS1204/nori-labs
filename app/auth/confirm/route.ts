import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { getServerSupabase } from "@/lib/supabase/server";

/** Only allow in-app paths as the post-login destination (no open redirect). */
function safeNext(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/library";
}

/**
 * Magic-link landing. Supabase redirects here after the user clicks the email
 * link. Depending on the email template this carries either a PKCE `code` or a
 * `token_hash` + `type`; handle both, establish the session cookie, then send
 * the user to `next` (the editor they came from, or the library).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = safeNext(searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await getServerSupabase();
  if (!supabase) {
    return NextResponse.redirect(`${origin}/login?error=unconfigured`);
  }

  let error: string | null = null;
  if (code) {
    ({ error } = await exchange(() => supabase.auth.exchangeCodeForSession(code)));
  } else if (tokenHash && type) {
    ({ error } = await exchange(() =>
      supabase.auth.verifyOtp({ type, token_hash: tokenHash }),
    ));
  } else {
    error = "missing_params";
  }

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=link&next=${encodeURIComponent(next)}`,
    );
  }
  return NextResponse.redirect(`${origin}${next}`);
}

/** Normalises a Supabase auth call to `{ error }`. */
async function exchange(
  fn: () => Promise<{ error: { message: string } | null }>,
): Promise<{ error: string | null }> {
  const { error } = await fn();
  return { error: error ? error.message : null };
}
