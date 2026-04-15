import "mapbox-gl/dist/mapbox-gl.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map: Browse Cafes",
  description: "See all the cafes near you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
