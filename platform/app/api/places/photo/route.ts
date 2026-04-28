import { NextResponse } from "next/server";

/** Proxies Places photo URLs so GOOGLE_* key stays server-side */
export async function GET(req: Request) {
  const key = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Maps key not configured" }, { status: 500 });
  }
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("photo_reference");
  const mw = Math.min(640, Math.max(64, Number(searchParams.get("maxwidth") ?? 320)));
  if (!ref) {
    return NextResponse.json({ error: "photo_reference required" }, { status: 400 });
  }
  const u = `https://maps.googleapis.com/maps/api/place/photo?photo_reference=${encodeURIComponent(ref)}&maxwidth=${mw}&key=${encodeURIComponent(key)}`;
  const r = await fetch(u, { redirect: "follow" });
  if (!r.ok) {
    return NextResponse.json({ error: "Photo fetch failed" }, { status: 502 });
  }
  const buf = await r.arrayBuffer();
  const ct = r.headers.get("content-type") ?? "image/jpeg";
  return new NextResponse(buf, {
    headers: {
      "Content-Type": ct,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
