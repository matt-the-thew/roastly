import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <>
      <nav className="fixed top-0 font-display h-20 z-10 bg-background w-full md:px-15 lg:px-20 border-b-4 border-b-slate-300 flex justify-between md:justify-between lg:justify-between items-center">
        <div className="w-full max-wd-400 flex">
          <div className="w-50 h-full flex justify-center items-center">
            <Link href={"/"}>
              <Image
                src={"/logo.svg"}
                alt="Roastly logo"
                width={145.891}
                height={49.594}
              />
            </Link>
          </div>
          <div className="hidden md:flex lg:flex gap-4 items-center *:hover:bg-slate-400 *:hover:text-background *:duration-150 *:p-3 *:rounded-md">
            <Link href={"/dashboard/homepage"}>Map</Link>
            <Link href={"#"}>About</Link>
            <Link href={"/blog"}>Blog</Link>
            <Link href={"#"}>Partners</Link>
          </div>
        </div>
        <div className="flex items-center min-w-20 *:hover:bg-slate-400 *:hover:text-background *:duration-150 *:p-3 *:rounded-md">
          <Link href={"/auth/login"}>Log In</Link>
        </div>
      </nav>
      <div className="h-20"></div>
    </>
  );
}
