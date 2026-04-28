import { NextResponse } from "next/server";
import { fetchPlaceDetails } from "@/lib/google-places";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const place_id = searchParams.get("place_id")?.trim();
  if (!place_id) {
    return NextResponse.json({ error: "place_id required" }, { status: 400 });
  }
  const place = await fetchPlaceDetails(place_id);
  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }
  return NextResponse.json({ place });
}
