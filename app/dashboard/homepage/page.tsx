"use client";
import MapComponent from "@/components/MapComponent";
import Navbar from "@/components/Navbar";

function HomePage() {
  return (
    <div className="flex flex-col h-full w-full">
      <Navbar></Navbar>
      <MapComponent></MapComponent>
    </div>
  );
}

export default HomePage;
