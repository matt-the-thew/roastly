import { useMapContext } from "@/lib/MapContext";
import DropdownMenu from "../DropdownMenu";

interface Props {
  children: React.ReactNode;
}

export default function CafeList({ children }: Props) {
  const { locations, setSelectedCity, setOverlayView } = useMapContext();

  return (
    <div>
      <div className="flex p-4 w-full">
        <div className="relative grow">
          <DropdownMenu sendStateData={setSelectedCity} />
        </div>
        <h1 className="text-sm text-foreground font-mono font-bold p-4 text-right">
          {locations.length} cafes available
        </h1>
      </div>
      <div className="flex flex-col items-center">
        {children}
        <h2 className="text-base mt-4">...don't see your favorite cafe?</h2>
        <button
          className="text-primary text-[1rem] italic hover:underline cursor-pointer mb-[20vh]"
          onClick={() => setOverlayView("submissionForm")}
        >
          suggest an addition
        </button>
      </div>
    </div>
  );
}
