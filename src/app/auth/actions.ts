"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { z } from "zod";

export interface AuthResult {
  ok: boolean;
  message?: string;
  error?: string;
}

const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signUpSchema = credentialsSchema.extend({
  full_name: z.string().trim().min(3, "Full name is required"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?234|0)[789][01]\d{8}$/, "Enter a valid Nigerian phone number")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export async function signIn(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: "Invalid email or password." };

  revalidatePath("/", "layout");
  redirect((formData.get("next") as string) || "/dashboard");
}

export async function signUp(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };

  const { email, password, full_name, phone } = parsed.data;
  const supabase = await createSupabaseServer();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      data: { full_name, phone },
    },
  });
  if (error) return { ok: false, error: error.message };

  // If email confirmation is disabled, a session exists — go straight in.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }
  return {
    ok: true,
    message:
      "Account created! Check your email for a confirmation link to activate your account.",
  };
}

const emailSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

const passwordOnlySchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/** Step 1 of recovery: email the user a password-reset link. */
export async function requestPasswordReset(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const parsed = emailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };

  const supabase = await createSupabaseServer();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });
  // Never reveal whether an email is registered.
  if (error) console.error("password reset request failed:", error.message);

  return {
    ok: true,
    message:
      "If that email is registered, a password-reset link is on its way. Check your inbox (and spam).",
  };
}

/** Step 2 of recovery: set a new password using the recovery session. */
export async function updatePassword(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const parsed = passwordOnlySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      ok: false,
      error: "Your reset link has expired. Please request a new one.",
    };

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

const profileSchema = z.object({
  full_name: z.string().trim().min(3, "Full name is required"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?234|0)[789][01]\d{8}$/, "Enter a valid Nigerian phone number")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

/** Update the signed-in user's own profile details. */
export async function updateProfileDetails(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) return { ok: false, error: "Could not save your details." };

  revalidatePath("/", "layout");
  revalidatePath("/dashboard/profile");
  return { ok: true, message: "Profile updated." };
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
