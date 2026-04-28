import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminJwt, adminCookieName } from "@/lib/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { generateSiteDraft } from "@/lib/anthropic-draft";

export const dynamic = "force-dynamic";

async function requireAdmin(): Promise<boolean> {
  const store = await cookies();
  const t = store.get(adminCookieName)?.value;
  if (!t) return false;
  return verifyAdminJwt(t);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let leadId: string;
  try {
    const j = (await req.json()) as { leadId?: string };
    if (!j.leadId) throw new Error("missing");
    leadId = j.leadId;
  } catch {
    return NextResponse.json({ error: "leadId required" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .select("id, intake")
    .eq("id", leadId)
    .single();
  if (error || !lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const intake = (lead.intake as Record<string, unknown>) || {};
  const draft = await generateSiteDraft(intake);

  await supabase
    .from("leads")
    .update({
      anthropic_last_draft: draft,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId);

  await supabase.from("builds").insert({
    lead_id: leadId,
    status: "draft_generated",
    draft_content: draft,
  });

  return NextResponse.json({ ok: true, draft });
}
