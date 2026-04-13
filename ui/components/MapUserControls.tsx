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
    <div className="fixed right-8 top-2 z-2">
      <Image
        src={"/logo.svg"}
        alt="Roastly logo"
        width={145.891}
        height={49.594}
        className="w-45"
      />
    </div>
  );
}
