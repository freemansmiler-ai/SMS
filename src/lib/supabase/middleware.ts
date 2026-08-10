import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnvConfig } from "./config";

/**
 * Next.js Server Middleware session & route protection handler.
 * Enforces role-based route protection and authentication checks.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { pathname } = request.nextUrl;
  const config = getSupabaseEnvConfig();

  // Define protected routes prefix list
  const isProtectedPath =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/principal") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/student") ||
    pathname === "/dashboard";

  const isLoginPage = pathname === "/login" || pathname === "/reset-password";

  const demoAuthCookie = request.cookies.get("sms-auth-session")?.value;
  const demoRoleCookie = request.cookies.get("sms-user-role")?.value || "administrator";

  // Check demo mode authentication state
  if (config.isPlaceholder || !config.isConfigured) {
    if (isProtectedPath && !demoAuthCookie) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isProtectedPath && demoAuthCookie) {
      if (pathname.startsWith("/admin") && demoRoleCookie !== "administrator") {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = `/${demoRoleCookie}`;
        return NextResponse.redirect(homeUrl);
      }
      if (pathname.startsWith("/principal") && demoRoleCookie !== "principal" && demoRoleCookie !== "administrator") {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = `/${demoRoleCookie}`;
        return NextResponse.redirect(homeUrl);
      }
      if (pathname.startsWith("/teacher") && demoRoleCookie !== "teacher" && demoRoleCookie !== "administrator") {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = `/${demoRoleCookie}`;
        return NextResponse.redirect(homeUrl);
      }
      if (pathname.startsWith("/student") && demoRoleCookie !== "student" && demoRoleCookie !== "administrator") {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = `/${demoRoleCookie}`;
        return NextResponse.redirect(homeUrl);
      }
    }

    if (isLoginPage && demoAuthCookie) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = `/${demoRoleCookie}`;
      return NextResponse.redirect(homeUrl);
    }

    return supabaseResponse;
  }

  // Supabase Live Client Session Verification
  const supabase = createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh and retrieve current authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  // If live Supabase user is not found, check if demo mode session cookie exists
  if (!user) {
    if (demoAuthCookie === "true") {
      if (isProtectedPath) {
        if (pathname.startsWith("/admin") && demoRoleCookie !== "administrator") {
          const homeUrl = request.nextUrl.clone();
          homeUrl.pathname = `/${demoRoleCookie}`;
          return NextResponse.redirect(homeUrl);
        }
        if (pathname.startsWith("/principal") && demoRoleCookie !== "principal" && demoRoleCookie !== "administrator") {
          const homeUrl = request.nextUrl.clone();
          homeUrl.pathname = `/${demoRoleCookie}`;
          return NextResponse.redirect(homeUrl);
        }
        if (pathname.startsWith("/teacher") && demoRoleCookie !== "teacher" && demoRoleCookie !== "administrator") {
          const homeUrl = request.nextUrl.clone();
          homeUrl.pathname = `/${demoRoleCookie}`;
          return NextResponse.redirect(homeUrl);
        }
        if (pathname.startsWith("/student") && demoRoleCookie !== "student" && demoRoleCookie !== "administrator") {
          const homeUrl = request.nextUrl.clone();
          homeUrl.pathname = `/${demoRoleCookie}`;
          return NextResponse.redirect(homeUrl);
        }
      }

      if (isLoginPage) {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = `/${demoRoleCookie}`;
        return NextResponse.redirect(homeUrl);
      }

      return supabaseResponse;
    }

    if (isProtectedPath) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  }

  if (user) {
    // Fetch profile role and account status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    const userRole = profile?.role || "administrator";
    const isActive = profile?.is_active !== false;

    if (!isActive) {
      // Deactivated account - force logout and redirect to login with error
      await supabase.auth.signOut();
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("error", "account_deactivated");
      return NextResponse.redirect(loginUrl);
    }

    if (isLoginPage) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = `/${userRole}`;
      return NextResponse.redirect(homeUrl);
    }

    // Role-based route protection
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
  }

  return supabaseResponse;
}
