"use server";

import { redirect } from "next/navigation";

export async function verifyBetaToken(formData: FormData) {
  const token = formData.get("token") as string;

  const res = await fetch(
    `${process.env.PUBLIC_ROASTLY_SITE_URL}/api/beta-token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    },
  );

  if (!res.ok) {
    throw new Error("Invalid or expired beta token");
  }

  const { cookies } = await import("next/headers");
  (await cookies()).set("beta_verified", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 30,
  });

  redirect("/login");
}
