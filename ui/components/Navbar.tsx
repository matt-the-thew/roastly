import Image from "next/image";
import Button from "./Button";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="font-display bg-cream h-30 flex justify-center border-b-4 border-b-amber-50">
      <div className="w-[80vw] flex justify-between items-center">
        <div className="flex flex-row items-end">
          <Link href={"/"}>
            <Image
              src={"/logo.svg"}
              alt="Roastly logo"
              width={145.891}
              height={49.594}
            />
            <p className="text-[10px]">EARLY_ALPHA</p>
          </Link>
        </div>
        <div className="flex gap-4">
          <Button content="Sign In" linkTo="/auth/login"></Button>
        </div>
      </div>
    </nav>
  );
}
