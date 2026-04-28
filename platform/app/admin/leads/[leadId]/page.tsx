import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { IntakeEditor } from "@/components/IntakeEditor";

export const dynamic = "force-dynamic";

export default async function AdminLeadDetail({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  const supabase = createServiceRoleClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (error || !lead) notFound();

  const intake = (lead.intake as Record<string, unknown>) || {};
  const draft = lead.anthropic_last_draft;

  return (
    <main className="grain min-h-screen px-6 py-10">
      <Link
        href="/admin/leads"
        className="text-[14px] text-forest underline underline-offset-2"
      >
        ← Queue
      </Link>
      <h1 className="font-display text-3xl font-semibold mt-6">{lead.business_name}</h1>
      <p className="mt-2 text-muted">
        {lead.full_name} · {lead.email} · <span className="tnum">{lead.phone}</span>
      </p>

      <div className="mt-10 grid lg:grid-cols-2 gap-10 max-w-[1200px]">
        <IntakeEditor leadId={leadId} initialIntake={intake} />
        <div>
          <p className="text-[13px] font-semibold text-forest uppercase tracking-[0.12em]">
            Last Claude draft JSON
          </p>
          <pre className="mt-4 rounded-xl bg-ink/[0.04] border border-rule p-4 text-[13px] overflow-auto max-h-[480px]">
            {draft ? JSON.stringify(draft, null, 2) : "— none yet —"}
          </pre>
          <p className="mt-6 text-[13px] text-muted leading-relaxed">
            After kickoff, paste structured fields into intake JSON (services, ICP, social proof
            links, reference sites). Then hit generate.
          </p>
        </div>
      </div>
    </main>
  );
}
