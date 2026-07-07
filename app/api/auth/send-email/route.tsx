"use server";
import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { Webhook } from "standardwebhooks";
import { EmailTemplate } from "@/components/EmailTemplate";

/**
 * Creates Resend client.
 */
const resend = new Resend(process.env.RESEND_EMAIL_KEY);

/**
 * Verifies a Supabase Send Email Hook request against the shared signing
 * secret (Standard Webhooks spec). The secret Supabase gives you looks like
 * `v1,whsec_<base64>`; the standardwebhooks lib wants it without the `v1,`.
 * Store the FULL value (including `v1,whsec_`) in SEND_EMAIL_HOOK_SECRET.
 *
 * @param rawBody - The exact, unparsed request body (bytes matter for HMAC).
 * @param request - Incoming request, for its webhook-* headers.
 * @returns The verified, parsed hook payload.
 * @throws If the secret is unset or the signature/timestamp is invalid.
 */
function verifyHook(rawBody: string, request: NextRequest): unknown {
  // `.trim()` defends against a trailing newline/space in the Vercel env value,
  // which would corrupt the decoded key and cause a signature mismatch.
  const secret = process.env.SEND_EMAIL_HOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("SEND_EMAIL_HOOK_SECRET is not set.");
  }

  // Strips the "v1," prefix from the passed secret, the webhook lib
  // strips the remaining prefix, "whsec_".
  const webhookObj = new Webhook(secret.replace(/^v1,/, ""));

  // TEMP diagnostics for "No matching signature found" — localizes whether the
  // failure is a malformed/short secret, a missing signature header, or an
  // empty body. Logs only shape, no secret material. Remove once resolved.

  //  console.log(
  //    `[send-email][diag] secretLen=${secret.length} ` +
  //      `prefix=${JSON.stringify(secret.slice(0, 9))} ` +
  //      `idHdr=${!!request.headers.get("webhook-id")} ` +
  //      `tsHdr=${!!request.headers.get("webhook-timestamp")} ` +
  //      `sigHdr=${!!request.headers.get("webhook-signature")} ` +
  //      `bodyLen=${rawBody.length}`,
  //  );

  return webhookObj.verify(rawBody, {
    "webhook-id": request.headers.get("webhook-id") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
  });
}

interface SendEmailHookPayload {
  user: {
    id: string;
    email: string;
  };
  email_data: {
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
  };
}

/**
 *
 * @param {string} actionType - Receives the {@link email_data.email_action_type}
 * @returns {string} Email subject.
 */
function getSubject(actionType: string): string {
  switch (actionType) {
    case "signup":
      return "Confirm your Roastly account";
    case "email_change":
      return "Confirm your new email address";
    case "recovery":
      return "Reset your Roastly password";
    case "magic_link":
      return "Your Roastly sign-in link";
    default:
      return "Action required for your Roastly account";
  }
}

/**
 * Handles incoming POST requests to api/auth/send-email.
 * That request *should* be a supabase `Send Email Hook`. If this is the case,
 * destructures the hook and builds the confirm URL;
 * Then sends the user the correct confirm URL via {@link resend}.
 * @param request {string} The incoming request.
 * @returns {Promise<NextResponse>}
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  /**
   * Holds the `Send Email Hook` from Supabase
   * See (the Supabase docs)[https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook]
   */
  let payload: SendEmailHookPayload;

  /*Read the RAW body first — the webhook signature is an HMAC over the exact
    bytes, so parsing before verifying would break the check. verifyHook both
    authenticates the caller (proves it's Supabase) and returns the parsed
    payload, so we don't JSON.parse separately.*/
  try {
    const rawBody = await request.text();
    payload = verifyHook(rawBody, request) as SendEmailHookPayload;
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error(`[send-email]: hook verification failed: ${message}`);
    return NextResponse.json(
      { error: "Unauthorized: invalid webhook signature." },
      { status: 401 },
    );
  }

  /**
   * Destructures the JSON `Send Email Hook` from Supabase into `user` and `email_data` fields.
   * @namespace
   * @property {object} user
   * @property {string} user.id
   * @property {string} user.aud
   * @property {string} user.role
   * @property {string} user.email
   * @property {string} user.phone
   * @property {object} email_data
   * @property {string} email_data.token
   * @property {string} email_data.token_hash
   * @property {string} email_data.redirect_to
   * @property {string} email_data.email_action_type
   */
  const { user, email_data } = payload;

  if (!user?.email || !email_data?.token_hash || !email_data?.redirect_to) {
    // This branch used to be silent, which made a 400 here indistinguishable
    // from the sign-up route's catch-block 400. Log exactly which fields are
    // missing plus the payload's top-level shape so a malformed/unexpected
    // hook payload is diagnosable from the logs rather than guessed at.
    const missing = [
      !user?.email && "user.email",
      !email_data?.token_hash && "email_data.token_hash",
      !email_data?.redirect_to && "email_data.redirect_to",
    ].filter(Boolean);
    console.error(
      `[send-email]: Missing required fields: ${missing.join(", ")}. ` +
        `payload keys=[${Object.keys(payload ?? {}).join(", ")}], ` +
        `email_data keys=[${Object.keys(email_data ?? {}).join(", ")}]`,
    );
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  const confirmUrl = new URL(email_data.redirect_to);
  confirmUrl.searchParams.set("token_hash", email_data.token_hash);
  confirmUrl.searchParams.set("type", email_data.email_action_type);

  const { error } = await resend.emails.send({
    from: "Roastly <no-reply@mail.roastly.dev>",
    to: user.email,
    subject: getSubject(email_data.email_action_type),
    react: (
      <EmailTemplate
        confirmUrl={confirmUrl.toString()}
        email={user.email}
        actionType={email_data.email_action_type}
      />
    ),
  });

  if (error) {
    console.error(`[send-email]: Resend error: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(
    `[send-email]: Sent ${email_data.email_action_type} email to ${user.email}`,
  );
  return NextResponse.json({ success: true });
}
