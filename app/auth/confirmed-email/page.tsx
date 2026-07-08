"use client";
import Image from "next/image";

/**
 * Successful email confirmation screen, solving the two-tab issue.
 * Previous behavior was to have the user simply have two tabs open with
 * two instances of Roastly; the original, used to create the account,
 * and an additional instance spawned by the redirect from the confirmation
 * email. This causes undesired behavior, and is basically a hardcoded
 * race confition.
 *
 * Solved with the page below; a static, simply "please close this tab"
 * screen, which supabase will be instructed to redirect to in the confirmation
 * link.
 */
function ConfirmedEmail() {
  return (
    <div className="pt-[10%]">
      <div
        className="relative w-120 rounded-2xl border border-gray-200 m-auto 
        flex flex-col items-center"
      >
        <Image
          src={"/branding/roastly-logo.svg"}
          alt="Roastly logo"
          width={145.891}
          height={49.594}
          className="w-50 mt-10"
        />

        <div
          className="flex flex-col justify-center items-center p-2 gap-3 
          w-full mb-5 text-center"
        >
          <h1 className="text-gray-800 text-lg font-medium mt-2">
            Your email is verified!
          </h1>
          <p className="text-gray-500 w-[80%]">
            You can safely close this tab.
          </p>
          <p className="text-sm text-gray-400 w-[80%]">Welcome to Roastly!</p>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmedEmailPage() {
  return <ConfirmedEmail />;
}
