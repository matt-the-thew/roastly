"use client";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { browserClient } from "@/lib/supabase/client";

/**
 * Post-sign-up "check your email" screen.
 *
 * While the user waits, we poll Supabase for a confirmed session. Clicking the
 * confirmation link (in this browser, even in another tab) writes the auth
 * cookie shared across the origin, so this page can detect it and forward the
 * user on — mirroring the destination logic in /api/auth/confirm.
 */
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [confirmed, setConfirmed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    /*Only poll when the visitor is actually mid-verification. The sign-up flow
      always arrives with ?email=..., so a bare visit to this URL renders the
      static message without ever opening a polling loop against Supabase.*/
    if (!email) return;

    const supabase = browserClient();
    let cancelled = false;

    /*Decide where a freshly-confirmed user should land: onboarding if they
      have no profile row yet, otherwise the dashboard. Mirrors the logic in
      app/api/auth/confirm/route.ts so both entry points behave the same.*/
    async function forwardConfirmedUser() {
      if (cancelled) return;
      setConfirmed(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;
      router.replace(profile ? "/dashboard/homepage" : "/onboarding");
    }

    /*Cap the polling so an abandoned tab can't hit the auth endpoint forever.
      At one poll per 3s, 100 polls is ~5 minutes of *visible* time, after which
      we stop and prompt the user instead of looping indefinitely.*/
    const MAX_POLLS = 100;
    let polls = 0;

    /*Poll every few seconds for a confirmed session. getUser() reads the
      session from the shared auth cookie, so this catches confirmations made
      in another tab of the same browser.*/
    const interval = setInterval(async () => {
      /*Skip work while the tab is backgrounded — no point polling an unseen
        page, and it keeps the cap measured in real user-facing time.*/
      if (document.hidden) return;

      if (++polls > MAX_POLLS) {
        clearInterval(interval);
        if (!cancelled) setTimedOut(true);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        clearInterval(interval);
        forwardConfirmedUser();
      }
    }, 3000);

    /*Also react instantly to auth changes within this tab.*/
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email_confirmed_at) {
        clearInterval(interval);
        forwardConfirmedUser();
      }
    });

    return () => {
      cancelled = true;
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [router, email]);

  return (
    <div className="pt-[10%]">
      <div className="relative w-120 rounded-2xl border border-gray-200 m-auto flex flex-col items-center">
        <Image
          src={"/branding/roastly-logo.svg"}
          alt="Roastly logo"
          width={145.891}
          height={49.594}
          className="w-50 mt-10"
        />

        <div className="flex flex-col justify-center items-center p-2 gap-3 w-full mb-5 text-center">
          <h1 className="text-gray-800 text-lg font-medium mt-2">
            Verify your account
          </h1>
          <p className="text-gray-500 w-[80%]">
            {email ? (
              <>
                We sent a confirmation link to{" "}
                <span className="text-gray-800 font-medium">{email}</span>.
                Click it to activate your account.
              </>
            ) : (
              <>
                We sent you a confirmation link. Click it to activate your
                account.
              </>
            )}
          </p>
          <p className="text-sm text-gray-400 w-[80%]">
            {confirmed
              ? "Email confirmed — taking you in…"
              : timedOut
                ? "Still waiting? Check your inbox, or head back and sign in again."
                : "Waiting for confirmation… you can keep this page open."}
          </p>
        </div>

        <div className="h-0.5 rounded-md w-[77%] border-t border-gray-300"></div>
        <Link
          href={"/auth/login"}
          className="text-sm text-gray-500 m-3 hover:underline mb-5"
        >
          Go Back
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  /*useSearchParams requires a Suspense boundary in the App Router.*/
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
