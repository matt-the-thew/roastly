import { NextResponse } from "next/server";

// Placeholder for the server-issued Mapbox token endpoint (see the unimplemented
// MapTokenManager). Until it's built, respond 501 rather than leaving an empty,
// non-module file that breaks Next's route type validator. The map currently
// uses the public NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN directly.
export function GET() {
  return NextResponse.json(
    { error: "Map token endpoint is not implemented yet." },
    { status: 501 },
  );
}
