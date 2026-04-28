import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { CheckoutButton } from "@/components/CheckoutButton";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  const supabase = createServiceRoleClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .select("id, business_name, full_name, email, funnel_stage")
    .eq("id", leadId)
    .single();

  if (error || !lead) notFound();

  return (
    <main className="grain min-h-screen px-6 py-16 max-w-lg mx-auto text-center">
      <p className="text-[13px] font-semibold text-forest uppercase tracking-[0.12em]">
        Secure checkout · Lazarus LLC
      </p>
      <h1 className="font-display text-[32px] font-semibold mt-4">
        Host &amp; maintain {lead.business_name}
      </h1>
      <p className="mt-4 text-[17px] text-ink/75 leading-relaxed">
        <strong className="text-ink">$197/mo</strong> — hosting, SSL, updates, security
        monitoring, unlimited small content changes. Month-to-month. Cancel anytime.
      </p>
      <p className="mt-2 text-[14px] text-muted">
        Logged in as {lead.full_name} · {lead.email}
      </p>
      <CheckoutButton leadId={leadId} />
      <p className="mt-12 text-[13px] text-muted">
        rather DIY? You already have the export path from Patrizio — no hard feelings.
      </p>
      <Link href="/free-website" className="mt-8 inline-block text-forest underline text-sm">
        Back to marketing site
      </Link>
    </main>
  );
}
