import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnvConfig } from "./config";

/**
 * Next.js Server Proxy session & route protection handler.
 *
 * Performance strategy:
 *  - `supabase.auth.getUser()` is always called (required to refresh the session cookie).
 *  - The expensive `profiles` DB query is cached in a short-lived cookie (`x-role-cache`).
 *    On subsequent navigations the cookie is read directly — no extra DB round trip.
 *  - The cache is invalidated whenever the session user changes or the cookie is absent.
 *  - Static assets and Next.js internals are excluded by the proxy `matcher`.
 */

const ROLE_CACHE_COOKIE = "x-role-cache";
const ROLE_CACHE_TTL_SECONDS = 300; // 5 minutes

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { pathname } = request.nextUrl;
  const config = getSupabaseEnvConfig();

  const isProtectedPath =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/principal") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/student") ||
    pathname === "/dashboard";

  const isLoginPage = pathname === "/login" || pathname === "/reset-password";

  // Always create the Supabase client so the session cookie gets refreshed.
  const supabase = createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Required: refreshes the session token on every request.
  const { data: { user } } = await supabase.auth.getUser();

  // Unauthenticated users — redirect to login for protected paths only.
  if (!user) {
    // Clear any stale role cache
    supabaseResponse.cookies.delete(ROLE_CACHE_COOKIE);

    if (isProtectedPath) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  // For authenticated users on paths that don't need role enforcement, skip DB.
  if (!isProtectedPath && !isLoginPage) {
    return supabaseResponse;
  }

  // --- Role resolution with caching ---
  // Read the cached role cookie. Format: "<userId>:<role>:<isActive>"
  const cachedRaw = request.cookies.get(ROLE_CACHE_COOKIE)?.value;
  let userRole: string | null = null;
  let isActive = true;

  if (cachedRaw) {
    const [cachedUserId, cachedRole, cachedActive] = cachedRaw.split(":");
    if (cachedUserId === user.id && cachedRole) {
      // Cache hit — use stored values, skip the DB query entirely.
      userRole = cachedRole;
      isActive = cachedActive !== "false";
    }
  }

  if (!userRole) {
    // Cache miss — fetch from DB and populate the cache.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.auth.signOut();
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("error", "profile_not_found");
      return NextResponse.redirect(loginUrl);
    }

    userRole = profile.role as string;
    isActive = profile.is_active !== false;

    // Write the cache cookie — httpOnly so JS can't tamper with it.
    supabaseResponse.cookies.set(ROLE_CACHE_COOKIE, `${user.id}:${userRole}:${isActive}`, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: ROLE_CACHE_TTL_SECONDS,
      path: "/",
    });
  }

  // Deactivated account — force logout.
  if (!isActive) {
    await supabase.auth.signOut();
    supabaseResponse.cookies.delete(ROLE_CACHE_COOKIE);
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("error", "account_deactivated");
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login / dashboard to their home.
  if (isLoginPage || pathname === "/dashboard") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = `/${userRole}`;
    return NextResponse.redirect(homeUrl);
  }

  // Role-based route enforcement.
  if (pathname.startsWith("/admin") && userRole !== "administrator") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = `/${userRole}`;
    return NextResponse.redirect(homeUrl);
  }
  if (pathname.startsWith("/principal") && userRole !== "principal" && userRole !== "administrator") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = `/${userRole}`;
    return NextResponse.redirect(homeUrl);
  }
  if (pathname.startsWith("/teacher") && userRole !== "teacher" && userRole !== "administrator") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = `/${userRole}`;
    return NextResponse.redirect(homeUrl);
  }
  if (pathname.startsWith("/student") && userRole !== "student" && userRole !== "administrator") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = `/${userRole}`;
    return NextResponse.redirect(homeUrl);
  }

  return supabaseResponse;
}
