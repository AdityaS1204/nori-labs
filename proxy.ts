import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next 16 renamed the `middleware` file convention to `proxy`. This runs before
 * routes render and keeps the Supabase auth session fresh. It does NOT gate
 * routes — browsing (including the library) stays open to anonymous visitors;
 * saving is gated in the UI instead.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on pages, skip static assets and image files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:webp|png|jpg|jpeg|svg|gif|ico|txt|xml)$).*)",
  ],
};
