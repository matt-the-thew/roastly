import { useState } from "react";

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
        className={`${extended ? "" : "h-15 overflow-hidden "}`}
        onClick={toggleExtended}
      >
        <ul
          className={`*:bg-[#eaeaea] *:px-2 *:py-0.5 *:rounded-sm flex flex-wrap justify-end gap-2 w-50 text-sm italic cursor-pointer hover:**:shadow-md **:duration-200`}
        >
          <li>work-friendly</li>
          <li>low key</li>
          <li>teas</li>
          <li>social</li>
          <li>artsy</li>
          {!extended && <p>...</p>}
          <li>work-friendly</li>
          <li>low key</li>
          <li>teas</li>
          <li>social</li>
          <li>artsy</li>
        </ul>
      </div>
    </div>
  );
}
