"use client";
import MapComponent from "@/ui/components/MapComponent";
import Navbar from "@/ui/components/Navbar";

function HomePage() {
  return (
    <div className="flex flex-col h-full w-full">
      <Navbar></Navbar>
      <MapComponent></MapComponent>
    </div>
  );
}

export default HomePage;
