import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { log } from "@/lib/logger";
import { EmailTemplate } from "@/ui/components/EmailTemplate";

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

function getSubject(actionType: string): string {
  switch (actionType) {
    case "signup": return "Confirm your Roastly account";
    case "email_change": return "Confirm your new email address";
    case "recovery": return "Reset your Roastly password";
    case "magic_link": return "Your Roastly sign-in link";
    default: return "Action required for your Roastly account";
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let payload: SendEmailHookPayload;

  try {
    payload = (await request.json()) as SendEmailHookPayload;
  } catch {
    log.warn("[send-email]: Failed to parse request body");
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { user, email_data } = payload;

  if (!user?.email || !email_data?.token_hash || !email_data?.redirect_to) {
    log.warn("[send-email]: Missing required fields in hook payload");
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
    log.warn(`[send-email]: Resend error: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  log.debug(`[send-email]: Sent ${email_data.email_action_type} email to ${user.email}`);
  return NextResponse.json({ success: true });
}
