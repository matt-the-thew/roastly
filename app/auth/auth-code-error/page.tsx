import Image from "next/image";
import Link from "next/link";

export default function AuthCodeError() {
  return (
    <div className="w-screen h-screen flex justify-center">
      <div
        className="flex flex-col gap-2 p-7 w-100 h-fit items-center ring
        ring-gray-300 mt-[30vh] rounded-md"
      >
        <Image
          src={"/branding/roastly-logo.svg"}
          alt="Roastly logo"
          width={145.891}
          height={49.594}
          className="w-50 h-auto"
        />
        <div className="m-4 mt-0 text-center *:p-2">
          <h1 className="text-primary text-2xl">Error:</h1>
          <p className="text-left">
            Authorization code error. Your one-time link is invalid, or has
            expired.
          </p>
          <div className="h-0.5 rounded-md w-full border-t border-gray-300 "></div>
          <Link
            href={"/auth/login"}
            className="text-sm text-gray-500 m-3 hover:underline mb-5"
          >
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
}
