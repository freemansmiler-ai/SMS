import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Next.js Proxy entry point (renamed from `middleware` in Next.js 16).
 *
 * This file MUST be named `proxy.ts` and live at `src/proxy.ts`
 * (or the project root) for Next.js to pick it up. The logic lives in
 * `src/lib/supabase/proxy.ts` so it can be unit-tested independently.
 *
 * What it does:
 *  1. Refreshes the Supabase session cookie on every request.
 *  2. Redirects unauthenticated users to /login for protected paths.
 *  3. Enforces role-based access — an admin cannot visit /teacher just by
 *     changing the URL; they are redirected to their own dashboard.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static assets)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - any file with a known image extension
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
