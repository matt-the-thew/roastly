import { useState } from "react";

export default function MarkerInterior({ name }) {
  return (
    <div className="text-center text-[14] font-bold cursor-pointer">
      📍
      <div className="bg-slate-200 rounded">{name}</div>
    </div>
  );
}
