"use client";
import MapView from "@/components/MapView";
import HomepageHeader from "@/components/HomepageHeader";
import InfoSidebar from "@/components/InfoSidebar";

function HomePage() {
  return (
    <div className="flex flex-col h-full w-full">
      <HomepageHeader></HomepageHeader>
      <InfoSidebar></InfoSidebar>
      <MapView></MapView>
    </div>
  );
}

export default HomePage;
