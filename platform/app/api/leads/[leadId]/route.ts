import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminJwt, adminCookieName } from "@/lib/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

async function requireAdmin(): Promise<boolean> {
  const store = await cookies();
  const t = store.get(adminCookieName)?.value;
  if (!t) return false;
  return verifyAdminJwt(t);
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ leadId: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { leadId } = await ctx.params;
  let intake: Record<string, unknown>;
  try {
    intake = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("leads")
    .update({
      intake,
      funnel_stage: "kickoff_complete",
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
