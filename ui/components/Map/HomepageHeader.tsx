"use client";
import { GrSettingsOption } from "react-icons/gr";
import { LuCircleUserRound } from "react-icons/lu";
import { MdOutlineInsertComment } from "react-icons/md";
import Image from "next/image";
import { useState, useEffect } from "react";
import generateUserName from "@/utils/username-placeholder";
import Link from "next/link";
import Modal from "./Modal";
import { IoCloseCircle } from "react-icons/io5";

export default function Navbar() {
  const [userName, setUserName] = useState("");
  const [visible, setVisible] = useState(false);

  return (
    <>
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
          <div className="flex items-center gap-5">
            <button
              onClick={() => {
                setVisible(!visible);
              }}
            >
              <MdOutlineInsertComment className="w-12 h-12  md:w-9 lg:w-9 hover:text-white duration-100" />
            </button>
            <Link href="#">
              <GrSettingsOption className="w-8 h-8 hover:text-white duration-100 hidden md:inline lg:inline" />
            </Link>
            <Link
              href="#"
              className="hover:text-white duration-100 flex items-center gap-2"
            >
              <LuCircleUserRound className="w-8 h-8 hidden md:inline lg:inline" />
            </Link>
          </div>
        </div>
      </nav>
      <Modal title="Ask Matt to Add a Cafe" isOpen={visible}>
        <button
          className="w-5 h-5 cursor-pointer z-1000"
          onClick={() => {
            setVisible(false);
          }}
        >
          <IoCloseCircle className="w-10 h-10 absolute top-3 left-3" />
        </button>
        <p className="text-sm hidden md:inline lg:inline">
          Roastly's database is growing by the day! If you have a favorite cafe,
          we would love to hear about it. Tell us why you love it, and Matt will
          see what he can do.
        </p>
      </Modal>
    </>
  );
}
