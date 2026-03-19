import { useEffect, useState } from "react";

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
            "bg-brew absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80vh] z-100 rounded-2xl shadow-2xl flex flex-col"
          }
        >
          <h2 className="text-2xl bg-white rounded-2xl p-8 text-slate-600 w-[80%] self-center text-center font-display mt-20">
            {title}
          </h2>

          <div className="w-[90%] h-[74%] mx-auto my-6 flex flex-col font-display  bg-white rounded-2xl px-7 py-0">
            {children}
          </div>
        </div>
      )}
    </>
  );
}
