import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /auth/callback
 *
 * Endpoint receiving the redirect from Supabase after a Magic Link click
 * (or any OAuth provider in the future). It exchanges the temporary code
 * for an actual session, then redirects the user to the requested next page.
 *
 * Required by Supabase Auth — without it, magic links 404.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successful authentication — redirect to the intended destination
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Failure path — send the user back to login with an error flag
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
