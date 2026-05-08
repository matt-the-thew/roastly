import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/EmailTemplate";

/**
 * Creates Resend client.
 */
const resend = new Resend(process.env.RESEND_EMAIL_KEY);

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

  try {
    payload = (await request.json()) as SendEmailHookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
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
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const confirmUrl = new URL(email_data.redirect_to);
  confirmUrl.searchParams.set("token_hash", email_data.token_hash);
  confirmUrl.searchParams.set("type", email_data.email_action_type);

  const { error } = await resend.emails.send({
    from: "Roastly <noreply@roastly.app>",
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
