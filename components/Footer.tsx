import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <>
      <footer className="font-display bg-background w-full h-50 flex border-t-4 border-slate-300">
        <div className="w-90 flex justify-evenly">
          <Image
            src={"/logo.svg"}
            alt="Roastly logo"
            height={240}
            width={680}
            className="w-60"
          ></Image>
        </div>
        <div className="flex flex-col gap-2 p-4 grow justify-center [&>p]:w-fit [&>p]:cursor-pointer [&>p]:hover:underline">
          <h1 className="text-xl">Company</h1>
          <p>About</p>
          <p>Blog</p>
          <Link href={"/privacy-policy"} className="hover:underline">
            Privacy Policy
          </Link>
        </div>
        <div className="flex flex-col gap-2 p-4 grow justify-center [&>p]:w-fit [&>p]:cursor-pointer [&>p]:hover:underline">
          <h1 className="text-xl">Store</h1>
          <p>Products</p>
          <p>Roasters</p>
          <p>Recommendations</p>
        </div>
      </footer>
    </>
  );
}
