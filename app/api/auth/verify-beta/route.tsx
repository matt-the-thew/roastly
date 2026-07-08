"use server";
import { NextRequest, NextResponse } from "next/server";
import { BetaKeyManager } from "@/app/actions/BetaKeyManager";
/* Server-only, is a protected API route */
import "server-only";

const keyManager = new BetaKeyManager();

export async function POST(request: NextRequest): Promise<NextResponse> {
  // get string from form data containing token
  const rawToken = (await request.json()).beta_key;

  if (!rawToken)
    return NextResponse.json(
      { error: "Unable to access beta token from request" },
      { status: 400 },
    );
  try {
    const auth_jwt_token: string = await keyManager.redeemBetaKey(rawToken);
    /*Send 200 OK with signed JWT on successful key redemption */
    return NextResponse.json({
      status: 200,
      message: "Token verififed.",
      sign_up_authorization_token: auth_jwt_token,
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error("[verify-beta]", err.message);
      return NextResponse.json({ error: err.message }, { status: 401 });
    } else {
      console.error("An unexpected error occurred:", err);
    }
  }
  /*Fail by default, if no conditions are met*/
  return NextResponse.json({ error: "Something went wrong." }, { status: 400 });
}
