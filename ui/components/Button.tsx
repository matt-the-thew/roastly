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
    backgroundStyle = "bg-primary";
    textColor = "text-gray-100";
    hoverColor = "hover:bg-accent";
    activeColor = "active:bg-amber-300";
  }

  return (
    <button
      className={`${backgroundStyle} p-2 min-w-fit text-nowrap rounded-lg ${hoverColor} ${activeColor} cursor-pointer transition duration-150`}
      onClick={clickEvent}
    >
      <p className={`${textColor} w-full h-full`}>{children}</p>
    </button>
  );
}
