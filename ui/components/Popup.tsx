import { useState } from "react";

interface PopupProps {
  name: string;
  description: string;
}

export default function Popup({ name, description }: PopupProps) {
  return (
    <div className="text-center text-[14] font-bold w-200 h-200">
      <h1>{name}</h1>
      <p>{description}</p>
    </div>
  );
}
