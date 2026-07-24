import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * Handles Supabase email confirmation / magic-link redirects.
 *
 * Supports both flows:
 *  - PKCE `code` (default email template → Supabase /verify → redirects here
 *    with ?code=…). exchangeCodeForSession both confirms AND signs the user in.
 *  - `token_hash` + `type` (custom email template using {{ .TokenHash }}).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createSupabaseServer();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }

  // On failure, send recovery attempts to the reset page (which shows a clear
  // "link expired" prompt); everything else to login.
  const failTarget =
    next === "/reset-password" || type === "recovery"
      ? "/reset-password"
      : "/login?error=confirm";
  return NextResponse.redirect(new URL(failTarget, request.url));
}
