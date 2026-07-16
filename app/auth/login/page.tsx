"use client";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { LoginService } from "@/app/actions/LoginService";
import { useRouter } from "next/navigation";

/*Shape of the inline error surfaced to the user. `message` is always safe to
  render as-is (sanitised by friendlyLoginMessage); `code` is the stable
  Supabase code, used only to decide which extra affordance to show — never
  displayed.*/
type LoginError = { message: string; code?: string };

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  /*Remember the last submitted email so an "email not confirmed" error can
    deep-link the user to the verify-email page with their address prefilled.*/
  const [lastEmail, setLastEmail] = useState("");
  const router = useRouter();
  const loginService = new LoginService();

  /*Surface a failed email-confirmation redirect (from /api/auth/confirm) in the
    same inline banner the form uses for sign-in errors, rather than a transient
    toast — a persistent, actionable message reads better for something the user
    has to respond to. Read from window.location rather than useSearchParams to
    avoid forcing a Suspense boundary around this page.*/
  useEffect(() => {
    const urlError = new URLSearchParams(window.location.search).get("error");
    if (urlError === "confirmation_failed") {
      setError({
        message:
          "Your confirmation link was invalid or expired. Sign in below, or sign up again to get a new link.",
      });
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    setLastEmail(email);

    try {
      const result = await loginService.signInWithEmail(email, password);

      if (result.ok) {
        /*Leave the button in its loading state through the navigation — no
          setLoading(false) on this path, so it can't flash back to idle.*/
        router.push(
          `${process.env.NEXT_PUBLIC_ROASTLY_SITE_URL}/dashboard/homepage`,
        );
        return;
      }

      setError({ message: result.message, code: result.code });
      setLoading(false);
    } catch (err) {
      /*A throw here is a transport failure (network/DNS/CORS), not an auth
        rejection — those come back as result.ok === false above. Log the
        detail; show the user a generic, non-revealing message.*/
      console.error(
        `[Login_Error]: ${err instanceof Error ? err.message : String(err)}`,
      );
      setError({
        message:
          "Couldn't reach the server. Check your connection and try again.",
      });
      setLoading(false);
    }
  };

  /*Only a bad-credentials error is a per-field problem worth highlighting the
    inputs for; rate-limit / not-confirmed / network errors aren't.*/
  const credentialError = error?.code === "invalid_credentials";
  const inputClass = (invalid: boolean) =>
    `rounded-md border p-2 w-full outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/40 disabled:opacity-50 ${
      invalid ? "border-red-400 bg-red-50" : "border-gray-200"
    }`;

  return (
    <div className="w-screen h-screen flex justify-center">
      <div className="w-120 mt-[20vh] rounded-2xl border border-gray-200 flex flex-col items-center p-10 gap-6 h-fit">
        <Link href={"/"}>
          <Image
            src={"/branding/roastly-logo.svg"}
            alt="Roastly logo"
            width={145.891}
            height={49.594}
            className="w-50"
          />
        </Link>

        {/* Inline error banner — announced to assistive tech, and the single
            surface for both sign-in failures and confirmation-link errors. */}
        {error && (
          <div
            id="login-error"
            role="alert"
            aria-live="assertive"
            className="w-full rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex flex-col gap-1"
          >
            <span>{error.message}</span>
            {error.code === "email_not_confirmed" && lastEmail && (
              <Link
                href={`/auth/verify-email?email=${encodeURIComponent(lastEmail)}`}
                className="font-semibold underline hover:no-underline w-fit"
              >
                Confirm your email →
              </Link>
            )}
          </div>
        )}

        {/* Sign in with email & password */}
        <form
          name="sign-in"
          onSubmit={handleSubmit}
          aria-busy={loading}
          className="w-full flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-gray-600">
              Email
            </label>
            <input
              id="email"
              className={inputClass(credentialError)}
              type="email"
              name="email"
              placeholder="barista@example.com"
              autoComplete="username"
              aria-invalid={credentialError || undefined}
              aria-describedby={error ? "login-error" : undefined}
              disabled={loading}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-gray-600">
              Password
            </label>
            <input
              id="password"
              className={inputClass(credentialError)}
              type="password"
              name="password"
              placeholder="Your password"
              autoComplete="current-password"
              aria-invalid={credentialError || undefined}
              aria-describedby={error ? "login-error" : undefined}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex items-center justify-center gap-2 bg-primary text-white rounded-md p-2 font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading && (
              <span
                aria-hidden="true"
                className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
              />
            )}
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="flex gap-4 text-sm font-mono">
          <Link href="/auth/sign-up" className="hover:underline text-primary">
            Create account
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/" className="hover:underline text-gray-500">
            Go back
          </Link>
        </div>
      </div>
    </div>
  );
}
