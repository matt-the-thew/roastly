"use server";
import { cookies } from "next/headers";

export async function createKong(): Promise<undefined> {
  const cookieStore = await cookies();
  if (!cookieStore.get("kong")) {
    cookieStore.set("kong", "donkeyMonkey", {
      httpOnly: true,
      path: "/",
    });
  }
}
