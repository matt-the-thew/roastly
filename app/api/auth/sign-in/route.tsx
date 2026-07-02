"use server";
import { NextResponse, type NextRequest } from "next/server";
import { LoginService } from "@/app/actions/LoginService";
import "server-only";

export async function POST(request: NextRequest) {
  const loginService = new LoginService();
  const data = await request.json();
  const { email, password } = data;

  try {
    const signIn = await loginService.signInWithEmail(email, password);

    if (signIn) {
      return NextResponse.json(
        {
          message: "Signed in successfully.",
        },
        {
          status: 200,
        },
      );
    } else {
      return NextResponse.json(
        {
          success: false,
        },
        {
          status: 401,
        },
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 500,
        },
      );
    }
  }
  return NextResponse.json(
    {
      message: "Something went wrong",
    },
    {
      status: 500,
    },
  );
}
