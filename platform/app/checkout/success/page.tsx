import Link from "next/link";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  return (
    <main className="grain min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center">
      <span className="text-5xl leading-none">🎉</span>
      <h1 className="font-display mt-8 text-[36px] font-semibold">You&apos;re live on our stack</h1>
      <p className="mt-4 max-w-[480px] text-[17px] text-ink/75 leading-relaxed">
        Stripe session <code className="text-[13px] bg-white/70 px-1 rounded">{session_id ?? "—"}</code>
        — Patrizio&apos;s squad will finalize DNS within 24hrs and text you confirmations.
      </p>
      <Link
        href="/admin/leads"
        className="mt-10 rounded-full bg-forest px-8 py-3 text-cream font-semibold"
      >
        View lead queue
      </Link>
    </main>
  );
}
