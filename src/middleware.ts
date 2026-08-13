import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js Middleware entry point.
 *
 * This file MUST be named `middleware.ts` and live at `src/middleware.ts`
 * (or the project root) for Next.js to pick it up. The logic lives in
 * `src/lib/supabase/middleware.ts` so it can be unit-tested independently.
 *
 * What it does:
 *  1. Refreshes the Supabase session cookie on every request.
 *  2. Redirects unauthenticated users to /login for protected paths.
 *  3. Enforces role-based access — an admin cannot visit /teacher just by
 *     changing the URL; they are redirected to their own dashboard.
 */
export async function middleware(request: NextRequest) {
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
