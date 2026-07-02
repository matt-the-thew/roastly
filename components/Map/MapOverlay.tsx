import { useMapContext } from "@/lib/MapContext";
import CafeSubmissionForm from "../CafeList/CafeSubmissionForm";
import CafeList from "../CafeList/CafeList";
import CafeDetails from "../CafeList/CafeDetails";
import SocialFeed from "../Social/SocialFeed";
import ConversationList from "../Chat/ConversationList";
import ChatThread from "../Chat/ChatThread";
import FriendsPanel from "../Friends/FriendsPanel";

import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

export default function MapOverlay() {
  const {
    overlayView,
    sidebarVisible,
    setSidebarVisible,
    feedVisible,
    setFeedVisible,
  } = useMapContext();

  function renderView() {
    switch (overlayView) {
      case "cafeList":
        return <CafeList />;
      case "submissionForm":
        return <CafeSubmissionForm />;
      case "cafeDetails":
        return <CafeDetails />;
      case "conversationList":
        return <ConversationList />;
      case "chatThread":
        return <ChatThread />;
      case "friends":
        return <FriendsPanel />;
      default:
        return null;
    }
  }

  return (
    <>
      {/* Left sidebar: cafe list / details / submission */}
      <div
        className={`fixed z-2 h-[95vh] w-113 top-[2.5vh] ${sidebarVisible ? "left-8" : "-left-116"} bg-background rounded-xl flex flex-col items-center overflow-hidden duration-300`}
      >
        <div className="overflow-auto w-full h-full">{renderView()}</div>
      </div>

      {/* Toggle button */}
      <button
        className={`fixed flex items-center justify-end bg-background w-12 h-20 rounded-lg z-1 ${sidebarVisible ? "left-114" : "-left-5"} top-[45vh] cursor-pointer hover:bg-primary duration-300`}
        onClick={() => setSidebarVisible(!sidebarVisible)}
      >
        {!sidebarVisible && (
          <IoIosArrowForward className="text-xl animate-pulse" />
        )}
        {sidebarVisible && (
          <IoIosArrowBack className="text-xl animate-pulse" />
        )}
      </button>

      {/* Right sidebar: social feed */}
      <div
        className={`fixed z-2 h-[95vh] w-80 top-[2.5vh] ${feedVisible ? "right-8" : "-right-80"} bg-background rounded-xl overflow-hidden transition-[right] duration-300`}
      >
        <SocialFeed />
      </div>

      {/* Feed toggle tab */}
      <button
        className={`fixed z-1 flex items-center bg-background w-10 h-20 rounded-l-lg top-[40%] ${feedVisible ? "right-83" : "-right-4"} cursor-pointer hover:bg-primary hover:text-white transition-[right,background-color] duration-300`}
        onClick={() => setFeedVisible(!feedVisible)}
      >
        {feedVisible ? (
          <IoIosArrowForward className="text-xl ml-0.5" />
        ) : (
          <IoIosArrowBack className="text-xl animate-pulse" />
        )}
      </button>
    </>
  );
}
