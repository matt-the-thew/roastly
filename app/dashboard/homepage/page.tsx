"use client";
import MapComponent from "@/ui/components/Map/MapComponent";
import HomepageHeader from "@/ui/components/Map/HomepageHeader";

function HomePage() {
  return (
    <div className="flex flex-col h-full w-full">
      <HomepageHeader></HomepageHeader>
      <MapComponent></MapComponent>
    </div>
  );
}

export default HomePage;
