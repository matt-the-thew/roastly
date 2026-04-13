"use client";
import MapComponent from "@/ui/components/MapComponent";
import MapUserControls from "@/ui/components/MapUserControls";
import MapCafeList from "@/ui/components/MapCafeList";
import MapCafeListEntry from "@/ui/components/MapCafeListEntry";

function HomePage() {
  return (
    <div className="flex flex-col h-full w-full">
      <MapUserControls></MapUserControls>
      <MapComponent>
        <MapCafeList visible={true} numberOfCafes={2}>
          <MapCafeListEntry
            distance={2}
            title="Hello world"
            rating={4}
          ></MapCafeListEntry>
          <MapCafeListEntry distance={2} title="Cafe time"></MapCafeListEntry>
          <MapCafeListEntry
            distance={2}
            title="Matt is great"
          ></MapCafeListEntry>
          <MapCafeListEntry distance={2} title="Uh huh"></MapCafeListEntry>
          <MapCafeListEntry distance={2} title="Let's go"></MapCafeListEntry>
          <MapCafeListEntry distance={2} title="Hello world"></MapCafeListEntry>
          <MapCafeListEntry distance={2} title="Cafe time"></MapCafeListEntry>
          <MapCafeListEntry
            distance={2}
            title="Matt is great"
          ></MapCafeListEntry>
          <MapCafeListEntry distance={2} title="Uh huh"></MapCafeListEntry>
          <MapCafeListEntry distance={2} title="Let's go"></MapCafeListEntry>
        </MapCafeList>
      </MapComponent>
    </div>
  );
}

export default HomePage;
