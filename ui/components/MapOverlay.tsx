import { useMapContext } from "@/lib/MapContext";
import CafeSubmissionForm from "./CafeSubmissionForm";
import CafeList from "./CafeList";
import CafeListEntry from "@/ui/components/CafeListEntry";
import CafeDetails from "./CafeDetails";

import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

export default function MapOverlay() {
  const { locations, overlayView, sidebarVisible, setSidebarVisible } =
    useMapContext();

  function renderView() {
    switch (overlayView) {
      case "cafeList":
        return (
          <CafeList>
            {locations.map((location) => (
              <CafeListEntry
                title={location.name}
                rating={location.rating}
                description={location.description}
                key={location.id}
                location={location}
              />
            ))}
          </CafeList>
        );
      case "submissionForm":
        return <CafeSubmissionForm />;
      case "cafeDetails":
        return <CafeDetails />;
      default:
        return null;
    }
  }

  return (
    <>
      <div
        className={`fixed z-2 h-[95vh] w-113 top-[2.5vh] ${sidebarVisible ? "left-8" : "-left-116"} bg-background rounded-xl flex flex-col items-center overflow-hidden duration-300`}
      >
        <div className="overflow-auto w-full h-full">{renderView()}</div>
      </div>
      <button
        className={`fixed flex items-center justify-end bg-background w-12 h-20 rounded-lg z-1 ${sidebarVisible ? "left-114" : "-left-5"} top-[45vh] cursor-pointer hover:bg-primary duration-300`}
        onClick={() => setSidebarVisible(!sidebarVisible)}
      >
        {!sidebarVisible && (
          <IoIosArrowForward className="text-xl animate-pulse" />
        )}
        {sidebarVisible && <IoIosArrowBack className="text-xl animate-pulse" />}
      </button>
    </>
  );
}
