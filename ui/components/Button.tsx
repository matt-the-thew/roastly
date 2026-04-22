import { MouseEventHandler } from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: string;
  clickEvent?: MouseEventHandler;
}

export default function Button({
  children,
  variant = "standard",
  clickEvent,
}: ButtonProps) {
  let backgroundStyle;
  let textColor;
  let hoverColor;
  let activeColor;

  if (variant == "ghost") {
    backgroundStyle = "bg-transparent";
    textColor = "text-black";
    hoverColor = "hover:bg-slate-300";
    activeColor = "active:bg-slate-100";
  }
  if (variant == "standard") {
    backgroundStyle = "bg-brew";
    textColor = "text-gray-100";
    hoverColor = "hover:bg-cacus";
    activeColor = "active:bg-amber-300";
  }

  return (
    <button
      className={`${backgroundStyle} min-w-fit text-nowrap rounded-lg ${hoverColor} ${activeColor} transition duration-150`}
      onClick={clickEvent}
    >
      <p className={`${textColor} w-full h-full`}>{children}</p>
    </button>
  );
}
