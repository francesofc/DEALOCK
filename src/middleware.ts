import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Next.js middleware — runs before every matched request.
 *
 * Protects the entire app behind Supabase Auth. Any request without an
 * active session is redirected to /login (preserving the original
 * destination via ?next= for redirection after sign-in).
 *
 * Public routes (login, signup, auth callback, static assets) are left
 * untouched.
 */

// Routes accessible without authentication
const PUBLIC_ROUTES = ["/login", "/signup", "/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Let public routes through immediately
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 2. Build the response object that we'll return (and possibly mutate)
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // 3. Create a Supabase client wired to read/write cookies on this request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // 4. Refresh and read the user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 5. No user → redirect to /login (preserving destination)
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 6. User is authenticated — let the request through
  return response;
}

/**
 * Match every route EXCEPT static assets and Next internals.
 * This keeps the auth check fast and avoids breaking image/font loading.
 */
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, etc.
     * - public assets (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|brand|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
