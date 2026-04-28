import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchAutocomplete } from "@/lib/google-places";

export const dynamic = "force-dynamic";

const Body = z.object({
  input: z.string().min(1).max(500),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const suggestions = await fetchAutocomplete(parsed.data.input);
  return NextResponse.json({ suggestions });
}
