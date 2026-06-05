"use client";
import Image from "next/image";

export default function BetaLoginPage() {
  return (
    <div className="w-screen h-screen flex justify-center">
      <form className="mt-[30vh] flex flex-col justify-center p-2 gap-2 items-center border border-slate-400 rounded-2xl w-80 h-60">
        <Image
          alt="Roastly logo"
          src={"/Branding/roastly-logo.svg"}
          width={145.891}
          height={49.594}
          className="self-center w-40"
        />
        <label htmlFor="beta token">Enter your Beta Token:</label>
        <input
          name="beta_token"
          placeholder="XXXX-XXXX"
          className="border border-slate-400 rounded-md w-[80%] p-2"
        ></input>
        <button
          type="submit"
          className="bg-primary rounded-md text-white p-2 w-[80%]"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
