"use client";
import "mapbox-gl/dist/mapbox-gl.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
