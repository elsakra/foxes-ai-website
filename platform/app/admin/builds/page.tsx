import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export default async function BuildsPage() {
  const supabase = createServiceRoleClient();
  const { data: rows, error } = await supabase
    .from("builds")
    .select("id, created_at, status, preview_url, lead_id")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <main className="p-10">
        <p className="text-amber">{error.message}</p>
      </main>
    );
  }

  const ids = [...new Set((rows ?? []).map((r) => r.lead_id).filter(Boolean))] as string[];
  let nameByLead: Record<string, string> = {};
  if (ids.length) {
    const { data: leads } = await supabase
      .from("leads")
      .select("id, business_name")
      .in("id", ids);
    nameByLead = Object.fromEntries(
      (leads ?? []).map((l) => [l.id as string, (l.business_name as string) || ""])
    );
  }

  return (
    <main className="grain min-h-screen px-6 py-10">
      <div className="max-w-[1000px] mx-auto flex justify-between items-center">
        <h1 className="font-display text-3xl font-semibold">Build queue</h1>
        <Link href="/admin/leads" className="text-forest underline text-sm font-medium">
          Leads ·
        </Link>
      </div>
      <div className="max-w-[1000px] mx-auto mt-8 rounded-2xl border border-rule bg-white overflow-x-auto shadow-sm">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-cream border-b border-rule uppercase text-[11px] text-muted tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4">Started</th>
              <th className="py-3 px-4">Business</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Preview</th>
            </tr>
          </thead>
          <tbody>
            {rows?.map((b) => (
              <tr key={b.id} className="border-b border-rule/80">
                <td className="py-3 px-4 whitespace-nowrap text-[13px] text-muted">
                  {new Date(b.created_at as string).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  {b.lead_id ? nameByLead[b.lead_id as string] ?? b.lead_id : "—"}
                </td>
                <td className="py-3 px-4 capitalize">{b.status}</td>
                <td className="py-3 px-4 truncate max-w-[200px]">
                  {b.preview_url ? (
                    <a
                      href={b.preview_url as string}
                      target="_blank"
                      rel="noreferrer"
                      className="text-forest underline"
                    >
                      Open
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows?.length && (
          <p className="p-10 text-center text-muted">Nothing in the build table yet.</p>
        )}
      </div>
    </main>
  );
}
