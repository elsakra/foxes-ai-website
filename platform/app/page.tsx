import Link from "next/link";

export default function HomePage() {
  return (
    <main className="grain min-h-screen px-8 py-16 max-w-xl mx-auto">
      <span className="text-3xl leading-none">🦊</span>
      <h1 className="font-display mt-6 text-[32px] font-semibold tracking-tight">
        Foxes.ai platform
      </h1>
      <p className="mt-4 text-muted text-[17px] leading-relaxed">
        Marketing onboarding lives here. Deploy this app for ads at{" "}
        <code>/onboarding</code> (<code>/free-website</code> redirects for legacy links).
      </p>
      <ul className="mt-8 space-y-3 text-[16px] text-forest font-medium">
        <li>
          <Link href="/onboarding" className="underline decoration-forest/40 underline-offset-4">
            /onboarding
          </Link>{" "}
          · Ad landing + onboarding experience
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
