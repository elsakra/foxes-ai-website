import Link from "next/link";

export default function HomePage() {
  return (
    <main className="grain min-h-screen px-8 py-16 max-w-xl mx-auto">
      <span className="text-3xl leading-none">🦊</span>
      <h1 className="font-display mt-6 text-[32px] font-semibold tracking-tight">
        Foxes.ai platform
      </h1>
      <p className="mt-4 text-muted text-[17px] leading-relaxed">
        Marketing funnel lives here. Deploy this app at <code>/free-website</code> for Meta ads.
      </p>
      <ul className="mt-8 space-y-3 text-[16px] text-forest font-medium">
        <li>
          <Link href="/free-website" className="underline decoration-forest/40 underline-offset-4">
            /free-website
          </Link>{" "}
          · Ad destination + VSL embed + intake
        </li>
        <li>
          <Link href="/admin/login" className="underline decoration-forest/40 underline-offset-4">
            /admin/login
          </Link>{" "}
          · Internal queue
        </li>
      </ul>
      <p className="mt-12 text-[13px] text-muted leading-relaxed">
        Static brochure site stays on the sibling Vite build (home/lander/DIY HTML).
      </p>
    </main>
  );
}
