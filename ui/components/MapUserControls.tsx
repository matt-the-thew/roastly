"use client";
import { GrSettingsOption } from "react-icons/gr";
import { LuCircleUserRound } from "react-icons/lu";
import { MdOutlineInsertComment } from "react-icons/md";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import Modal from "./Modal";
import { IoCloseCircle } from "react-icons/io5";

export default function Navbar() {
  const [userName, setUserName] = useState("");
  const [visible, setVisible] = useState(false);

  return (
    <div className="fixed right-14 top-2 z-2 hover:bg-background rounded-xl">
      <Link href={"/"}>
        <Image
          src={"/logo.svg"}
          alt="Roastly logo"
          width={145.891}
          height={49.594}
          className="w-45"
        />
        <p className="absolute bottom-0 -right-10 text-[0.8rem] font-mono">
          Alpha1.0.0
        </p>
      </Link>
    </div>
  );
}
