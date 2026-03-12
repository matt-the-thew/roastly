import { useState } from "react";

interface MarkerProps {
  name: string;
}

export default function MarkerInterior({ name }: MarkerProps) {
  return (
    <div className="text-center text-[14] font-bold cursor-pointer">
      📍
      <div className="bg-slate-200 rounded">{name}</div>
    </div>
  );
}
