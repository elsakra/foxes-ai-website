import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const supabase = createServiceRoleClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select(
      "id, created_at, business_name, full_name, email, phone, funnel_stage"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <main className="p-10">
        <p className="text-amber">{error.message}</p>
        <p className="mt-4 text-muted text-sm">
          Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + run migration.
        </p>
      </main>
    );
  }

  return (
    <main className="grain min-h-screen px-6 py-10">
      <div className="flex items-center justify-between max-w-[1100px] mx-auto">
        <div>
          <p className="text-[13px] font-semibold text-forest uppercase tracking-[0.12em]">
            Internal
          </p>
          <h1 className="font-display text-3xl font-semibold mt-1">
            Pending outbound leads
          </h1>
        </div>
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="text-[14px] text-muted hover:text-ink underline underline-offset-2"
          >
            Sign out
          </button>
        </form>
      </div>
      <div className="max-w-[1100px] mx-auto mt-8 rounded-2xl border border-rule bg-white overflow-x-auto shadow-sm">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-cream border-b border-rule text-muted text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 font-semibold">When</th>
              <th className="py-3 px-4 font-semibold">Business</th>
              <th className="py-3 px-4 font-semibold">Contact</th>
              <th className="py-3 px-4 font-semibold">Phone</th>
              <th className="py-3 px-4 font-semibold">Stage</th>
              <th className="py-3 px-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="text-ink/90">
            {leads?.map((l) => (
              <tr key={l.id} className="border-b border-rule/80">
                <td className="py-3 px-4 whitespace-nowrap tnum text-[13px] text-muted">
                  {new Date(l.created_at as string).toLocaleString()}
                </td>
                <td className="py-3 px-4">{l.business_name}</td>
                <td className="py-3 px-4">
                  {l.full_name}
                  <br />
                  <span className="text-[13px] text-muted">{l.email}</span>
                </td>
                <td className="py-3 px-4 tnum">{l.phone}</td>
                <td className="py-3 px-4 capitalize">{l.funnel_stage}</td>
                <td className="py-3 px-4">
                  <Link
                    href={`/admin/leads/${l.id}`}
                    className="font-semibold text-forest underline-offset-4 hover:text-amber"
                  >
                    Intake →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!leads?.length && (
          <p className="p-8 text-center text-muted">No rows yet.</p>
        )}
      </div>
    </main>
  );
}
