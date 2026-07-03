"use client";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { FormEvent, useState } from "react";

export default function SignUpPage() {
  /*Set in-memory variable for whether or not user has valid beta key.
    If this is true, the create account dialog is displayed. The JWT
    is still checked by api/auth/sign-up, and if invalid, the user can't
    do anything.*/
  const [validatedBetaUser, setvalidatedBetaUser] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Fetches api/auth/verify-beta, which runs HMAC on the key, and compares
   * it with existing data.
   * @returns {Promise<string>} - Resolves to signed JWT if successful.
   * @throws Will throw an error if beta key is not valid.
   */
  const handleBetaKeySubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const formDataObject = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/auth/verify-beta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataObject),
      });

      setLoading(false);

      /*Only parse JSON when the server actually sent JSON. A 404/500 often
        returns an HTML error page, which would otherwise crash JSON.parse
        with an opaque "Unexpected token '<'" error.*/
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const data = isJson ? await response.json() : null;

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `[Beta Key Verification Error]: Request failed (${response.status} ${response.statusText}).`,
        );
      }

      if (data?.sign_up_authorization_token) {
        setvalidatedBetaUser(data.sign_up_authorization_token);
        toast.success("Beta Key validated. Welcome to Roastly.");
      }
    } catch (err) {
      setLoading(false);
      if (err instanceof Error) {
        toast.error("There was a problem verifying your key.");
        throw new Error(`[Beta Key Verification Error]: ${err}`);
      } else {
        toast.error("There was a problem verifying your key.");
        throw new Error(
          `[Beta Key Verification Error]: An unknown error occurred: ${err}`,
        );
      }
    }
  };

  /**
   * Fetches api/auth/sign-up with sign up form data.
   * @param event {FormEvent<HTMLFormElement>} - Form submisison event provided by onSubmit
   * @returns {void}
   * @throws Error if user is not authorized to sign up, or if request is not successful.
   */
  const handleAccountCreationSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    /*Get formData from form element submission event */
    const formData = new FormData(event.currentTarget);
    /*Append in-memory JWT from react state.*/
    if (!validatedBetaUser)
      throw new Error("[Account Creation Error]: Unauthorized.");
    formData.append("beta_redeem", validatedBetaUser);
    const formDataObject = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataObject),
      });
      setLoading(false);

      /*Only attempt to parse JSON when the server actually sent JSON.
        A 404/500 often returns an HTML error page, and JSON.parse on
        "<!DOCTYPE ..." throws an opaque "Unexpected token '<'" error.*/
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const data = isJson ? await response.json() : null;

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `[Account Creation Error]: Request failed (${response.status} ${response.statusText}).`,
        );
      }
    } catch (err) {
      setLoading(false);
      if (err instanceof Error) {
        throw new Error(`[Account Creation Error]: ${err.message}`);
      }
      throw new Error(
        `[Account Creation Error]: An unknown error occurred, ${err}`,
      );
    }
  };

  return (
    <div className="pt-[10%]">
      <div className="relative w-120 rounded-2xl border border-gray-200 m-auto flex flex-col items-center">
        <Image
          src={"/branding/roastly-logo.svg"}
          alt="Roastly logo"
          width={145.891}
          height={49.594}
          className="w-50 mt-10"
        />

        {/*Display beta key entry if no beta key is entered*/}
        {!validatedBetaUser && (
          <form
            className="flex flex-col justify-center p-2 gap-2 items-center w-full mb-5"
            onSubmit={handleBetaKeySubmit}
          >
            <label className="text-gray-400">Enter your Beta Token:</label>
            <input
              name="beta_key"
              placeholder="XXXX-XXXX"
              className="text-center border border-gray-300 rounded-md w-[80%] p-2"
            ></input>
            <button
              type="submit"
              className="bg-primary rounded-md text-white p-2 w-[80%] cursor-pointer hover:ring-2 hover:ring-primary hover:border-primary hover:text-black hover:bg-background"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        )}

        {/*Display sign up dialog if API returns success*/}
        {validatedBetaUser && (
          <form
            onSubmit={handleAccountCreationSubmit}
            className="flex flex-col justify-center items-center p-2 gap-2 w-full mb-5"
          >
            <h1 className="text-gray-800 p-2">Create your account:</h1>
            <input
              className="border border-gray-200 rounded-md p-2 w-[80%]"
              type="text"
              name="email"
              placeholder="barista@example.com"
              autoComplete="username"
            />
            <input
              className="border border-gray-200 rounded-md p-2 w-[80%]"
              type="password"
              name="password"
              placeholder="************"
              autoComplete="current-password"
            />
            <button
              type="submit"
              className="bg-primary rounded-md text-white p-2 w-[80%] cursor-pointer hover:ring-2 hover:ring-primary hover:border-primary hover:text-black hover:bg-background"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        )}
        <div className="h-0.5 rounded-md w-[77%] border-t border-gray-300 "></div>
        <Link
          href={"/auth/login"}
          className="text-sm text-gray-500 m-3 hover:underline mb-5"
        >
          Go Back
        </Link>
      </div>
    </div>
  );
}
