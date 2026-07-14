interface EmailTemplateProps {
  confirmUrl: string;
  email: string;
  actionType: string;
}

function getHeading(actionType: string): string {
  switch (actionType) {
    case "signup":
      return "Welcome to Roastly";
    case "email_change":
      return "Confirm your new email";
    case "recovery":
      return "Reset your password";
    case "magic_link":
      return "Your sign-in link";
    default:
      return "Action required";
  }
}

function getBodyText(actionType: string): string {
  switch (actionType) {
    case "signup":
      return "Thanks for joining Roastly — the app for discovering and sharing your favourite cafes. Please confirm your email address to get started.";
    case "email_change":
      return "We received a request to update the email address on your Roastly account. Click the button below to confirm this change.";
    case "recovery":
      return "We received a request to reset the password on your Roastly account. Click the button below to choose a new password.";
    case "magic_link":
      return "Use the button below to sign in to your Roastly account. This link is valid for one hour.";
    default:
      return "Click the button below to complete the requested action on your Roastly account.";
  }
}

export function EmailTemplate({
  confirmUrl,
  email,
  actionType,
}: EmailTemplateProps) {
  const heading = getHeading(actionType);
  const bodyText = getBodyText(actionType);

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{heading}</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#f9fafb",
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        }}
      >
        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{ backgroundColor: "#f9fafb", padding: "40px 0" }}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  width="560"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    maxWidth: "560px",
                    width: "100%",
                  }}
                >
                  <tbody>
                    {/* Header */}
                    <tr>
                      <td
                        style={{
                          backgroundColor: "#1c1917",
                          padding: "28px 40px",
                          textAlign: "center",
                          borderRadius: "8px 8px 0 0",
                        }}
                      >
                        <span
                          style={{
                            color: "#fbbf24",
                            fontSize: "24px",
                            fontWeight: "700",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Roastly
                        </span>
                      </td>
                    </tr>

                    {/* Body */}
                    <tr>
                      <td style={{ padding: "40px 40px 32px" }}>
                        <h1
                          style={{
                            margin: "0 0 16px",
                            fontSize: "22px",
                            fontWeight: "700",
                            color: "#111827",
                            lineHeight: "1.3",
                          }}
                        >
                          {heading}
                        </h1>
                        <p
                          style={{
                            margin: "0 0 8px",
                            fontSize: "14px",
                            color: "#6b7280",
                          }}
                        >
                          For: {email}
                        </p>
                        <p
                          style={{
                            margin: "0 0 32px",
                            fontSize: "16px",
                            color: "#374151",
                            lineHeight: "1.6",
                          }}
                        >
                          {bodyText}
                        </p>

                        {/* CTA Button */}
                        <table
                          cellPadding="0"
                          cellSpacing="0"
                          style={{ margin: "0 0 32px" }}
                        >
                          <tbody>
                            <tr>
                              <td
                                style={{
                                  backgroundColor: "#b45309",
                                  borderRadius: "6px",
                                }}
                              >
                                <a
                                  href={confirmUrl}
                                  style={{
                                    display: "inline-block",
                                    padding: "14px 28px",
                                    color: "#ffffff",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    textDecoration: "none",
                                    borderRadius: "6px",
                                  }}
                                >
                                  {heading}
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Fallback link */}
                        <p
                          style={{
                            margin: "0",
                            fontSize: "13px",
                            color: "#6b7280",
                            lineHeight: "1.5",
                          }}
                        >
                          If the button above doesn&apos;t work, copy and paste
                          this link into your browser:
                        </p>
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: "13px",
                            lineHeight: "1.5",
                          }}
                        >
                          <a
                            href={confirmUrl}
                            style={{ color: "#b45309", wordBreak: "break-all" }}
                          >
                            {confirmUrl}
                          </a>
                        </p>
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td
                        style={{
                          borderTop: "1px solid #e5e7eb",
                          padding: "24px 40px",
                          textAlign: "center",
                          borderRadius: "0 0 8px 8px",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "12px",
                            color: "#9ca3af",
                          }}
                        >
                          You received this email because an account action was
                          requested for {email}. If you did not make this
                          request, you can safely ignore this email.
                        </p>
                        <p
                          style={{
                            margin: "8px 0 0",
                            fontSize: "12px",
                            color: "#9ca3af",
                          }}
                        >
                          &copy; {new Date().getFullYear()} Roastly
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
