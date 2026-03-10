"use client";
import { GrSettingsOption } from "react-icons/gr";
import { LuCircleUserRound } from "react-icons/lu";
import Image from "next/image";
import { useState, useEffect } from "react";
import generateUserName from "@/utils/username-placeholder";

export default function Navbar() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!userName) {
      setUserName(generateUserName());
    }
  });

  return (
    <>
      <Image
        src={"/logo.svg"}
        alt="Roastly logo"
        width={145.891}
        height={49.594}
      />
      <GrSettingsOption />
      <LuCircleUserRound className="w-8 h-8" />
      <p>{userName}</p>
    </>
  );
}
