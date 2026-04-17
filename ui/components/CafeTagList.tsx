import { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

export interface Props {
  tags?: Array<string>;
}

export default function CafeTagList({ tags }: Props) {
  const [extended, setExtended] = useState(false);

  function toggleExtended(): void {
    extended ? setExtended(false) : setExtended(true);
  }

  return (
    <div className="absolute -top-4 right-0 z-2 rounded-lg bg-background">
      <div
        className={`${extended ? "h-fit pb-2 shadow-lg" : "h-15 overflow-hidden "} duration-500`}
        onClick={toggleExtended}
      >
        <ul
          className={`*:bg-[#eaeaea] *:px-2 *:py-0.5 *:rounded-sm flex flex-wrap ${extended ? "justify-center " : "justify-end"} gap-2 w-50 text-sm italic cursor-pointer hover:**:shadow-md **:duration-200`}
        >
          <li>work-friendly</li>
          <li>low key</li>
          <li>teas</li>
          <li>social</li>
          <li>artsy</li>
          {/* TODO: fix shadow on these arrows */}
          {!extended && <p className="flex items-center"><IoIosArrowDown /></p>}
          <li>work-friendly</li>
          <li>low key</li>
          <li>teas</li>
          <li>social</li>
          <li>artsy</li>
             <li>work-friendly</li>
          <li>low key</li>
          <li>teas</li>
          <li>social</li>
          <li>artsy</li>
          {/* TODO: fix shadow on these arrows */}
          {extended && <p className="flex items-center"><IoIosArrowUp /></p>}
        </ul>
      </div>
    </div>
  );
}
