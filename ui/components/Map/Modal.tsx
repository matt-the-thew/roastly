import { useEffect, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";

interface ModalProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
}

export default function Modal({ title, children, isOpen = false }: ModalProps) {
  return (
    <>
      {isOpen && (
        <div
          className={
            "bg-slate-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-[90vh] min-h-fit z-100 rounded-2xl shadow-2xl"
          }
        >
          <h2 className="text-2xl text-slate-600 w-full text-center font-display mt-5">
            {title}
          </h2>
          <button className="w-5 h-5">
            <IoCloseCircle className="w-20" />
          </button>
          <div className="w-[80%] h-[95%] mx-auto my-6 flex flex-col">
            {children}
          </div>
        </div>
      )}
    </>
  );
}
