"use client";
import { GrSettingsOption } from "react-icons/gr";
import { LuCircleUserRound } from "react-icons/lu";
import Image from "next/image";
import { useState, useEffect } from "react";
import generateUserName from "@/utils/username-placeholder";
import Link from "next/link";

export default function Navbar() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!userName) {
      setUserName(generateUserName());
    }
  });

  return (
    <nav className="font-display bg-cream h-30 flex justify-center border-b-4 border-b-amber-50">
      <div className="w-[80vw] flex justify-between items-center">
        <Link href={"/"}>
          <div className="flex flex-row items-end">
            <Image
              src={"/logo.svg"}
              alt="Roastly logo"
              width={145.891}
              height={49.594}
            />
            <p className="text-[10px]">EARLY_ALPHA</p>
          </div>
        </Link>
        <div className="flex gap-4">
          <Link href="#">
            <GrSettingsOption className="w-8 h-8 hover:text-white duration-100" />
          </Link>
          <Link
            href="#"
            className="hover:text-white duration-100 flex items-center gap-2"
          >
            <LuCircleUserRound className="w-8 h-8 " />
            <p>{userName}</p>
          </Link>
        </div>
      </div>
    </nav>
  );
}
