import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { EmailTemplate } from "@/components/EmailTemplate";

const URL = "https://roastly.app/auth/confirm?token=abc123";

describe("EmailTemplate", () => {
  it("renders the signup heading and body copy", () => {
    const { container } = render(
      <EmailTemplate
        confirmUrl={URL}
        email="jane@example.com"
        actionType="signup"
      />,
    );
    expect(container.textContent).toContain("Welcome to Roastly");
    expect(container.textContent).toContain(
      "the app for discovering and sharing",
    );
    // recipient email surfaces in the "For:" line and the footer
    expect(container.textContent).toContain("For: jane@example.com");
    expect(container.textContent).toContain(
      "an account action was requested for jane@example.com",
    );
  });

  it("puts the confirm url on both the CTA button and the fallback link", () => {
    const { container } = render(
      <EmailTemplate confirmUrl={URL} email="a@b.com" actionType="signup" />,
    );
    const anchors = Array.from(
      container.querySelectorAll("a"),
    ) as HTMLAnchorElement[];
    const hrefs = anchors.map((a) => a.getAttribute("href"));
    expect(hrefs.filter((h) => h === URL).length).toBe(2);
    // the raw url is also shown as visible fallback text
    expect(container.textContent).toContain(URL);
  });

  it.each([
    ["email_change", "Confirm your new email", "update the email address"],
    ["recovery", "Reset your password", "reset the password"],
    ["magic_link", "Your sign-in link", "valid for one hour"],
  ])(
    "renders the %s heading and matching body text",
    (actionType, heading, bodyFragment) => {
      const { container } = render(
        <EmailTemplate
          confirmUrl={URL}
          email="x@y.com"
          actionType={actionType}
        />,
      );
      expect(container.textContent).toContain(heading);
      expect(container.textContent).toContain(bodyFragment);
    },
  );

  it("uses the default heading/body for an unknown action type", () => {
    const { container } = render(
      <EmailTemplate
        confirmUrl={URL}
        email="x@y.com"
        actionType="something_else"
      />,
    );
    expect(container.textContent).toContain("Action required");
    expect(container.textContent).toContain(
      "complete the requested action on your Roastly account",
    );
  });

  it("renders the current year in the footer", () => {
    const { container } = render(
      <EmailTemplate confirmUrl={URL} email="x@y.com" actionType="signup" />,
    );
    expect(container.textContent).toContain(String(new Date().getFullYear()));
  });
});
