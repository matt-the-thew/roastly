import Image from "next/image";
import Button from "./Button";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="font-display h-30 bg-cream w-full md:px-15 lg:px-20 border-b-4 border-b-amber-50 flex justify-center md:justify-between lg:justify-between items-center">
      <div className="px-6 h-fit">
        <Link href="/" className="flex flex-col">
          <Image src="/logo.svg" alt="Roastly logo" width={146} height={50} />
          <p className="text-[10px]">EARLY_ALPHA</p>
        </Link>
      </div>
      <div>
        <Button content="Sign In" linkTo="/auth/login" />
      </div>
    </nav>
  );
}
