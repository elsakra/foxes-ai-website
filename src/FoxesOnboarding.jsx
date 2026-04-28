import { useEffect, useMemo, useState, useTransition } from "react";

const META_PIXEL_ID =
  import.meta.env.VITE_ONBOARDING_META_PIXEL_ID || import.meta.env.VITE_FUNNEL_META_PIXEL_ID || "";

const VSL =
  import.meta.env.VITE_ONBOARDING_VSL_EMBED_URL || import.meta.env.VITE_FUNNEL_VSL_EMBED_URL || "";
const CONFIRM_VIDEO =
  import.meta.env.VITE_ONBOARDING_CONFIRM_EMBED_URL ||
  import.meta.env.VITE_ONBOARDING_CONFIRMATION_EMBED_URL ||
  import.meta.env.VITE_FUNNEL_CONFIRMATION_EMBED_URL ||
  "";

/** Next app (POST /api/leads) — Vercel production alias for project foxes-ai-platform */
const DEFAULT_PRODUCTION_API_ORIGIN = "https://foxes-ai-platform.vercel.app";

function getApiOrigin() {
  const direct = import.meta.env.VITE_ONBOARDING_API_ORIGIN?.trim().replace(/\/$/, "");
  if (direct) return direct;
  const legacy = import.meta.env.VITE_FUNNEL_API_URL || "";
  if (legacy) {
    try {
      return new URL(legacy).origin;
    } catch {
      /* fall through */
    }
  }
  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1") {
      return "http://localhost:3000";
    }
  }
  return DEFAULT_PRODUCTION_API_ORIGIN;
}

function useUtm() {
  return useMemo(() => {
    if (typeof window === "undefined") {
      return {};
    }
    const p = new URLSearchParams(window.location.search);
    return {
      utm_source: p.get("utm_source") ?? undefined,
      utm_medium: p.get("utm_medium") ?? undefined,
      utm_campaign: p.get("utm_campaign") ?? undefined,
      utm_content: p.get("utm_content") ?? undefined,
    };
  }, []);
}

function MetaPixelLoader() {
  useEffect(() => {
    if (!META_PIXEL_ID || typeof document === "undefined") return;
    if (document.getElementById(`fb-pixel-onb-${META_PIXEL_ID}`)) return;
    const s = document.createElement("script");
    s.id = `fb-pixel-onb-${META_PIXEL_ID}`;
    const id = JSON.stringify(META_PIXEL_ID);
    s.textContent = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', ${id});
fbq('track', 'PageView');`;
    document.head.appendChild(s);
  }, []);
  return null;
}

export default function FoxesOnboarding() {
  const apiOrigin = getApiOrigin();
  const utm = useUtm();
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [industryLabel, setIndustryLabel] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();

  const businessTrimmed = businessName.trim();
  const industryTrimmed = industryLabel.trim();
  const canContinueStep1 =
    businessTrimmed.length >= 1 && industryTrimmed.length >= 1;
  const canShowPhone = fullName.trim().length > 1 && /\S+@\S+\.\S+/.test(email.trim());
  const canSubmitStep2 = canShowPhone && phone.trim().length >= 8;

  const submitLead = () => {
    setError(null);
    if (!canSubmitStep2) {
      setError("Enter a valid mobile.");
      return;
    }
    startTransition(async () => {
      const res = await fetch(`${apiOrigin}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessTrimmed,
          industry: industryTrimmed,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          website: honeypot,
          ...utm,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(j.error && typeof j.error === "string" ? j.error : "Could not submit.");
        return;
      }
      setStep(3);
      queueMicrotask(() => {
        if (typeof window.fbq === "function") window.fbq("track", "Lead");
      });
    });
  };

  const timeline = [
    { title: "Your business", subtitle: "We use what you entered to prep creative direction." },
    { title: "Your contact", subtitle: "We reach you inside 1–2 business hours." },
    { title: "Kickoff", subtitle: "We prep creative + technical roadmap." },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      <MetaPixelLoader />
      <aside className="lg:w-[42%] w-full onboarding-gradient lg:min-h-screen flex flex-col">
        <div className="p-8 lg:p-12 flex flex-col flex-1">
          <p className="text-[13px] font-semibold text-onboarding-blue uppercase tracking-[0.12em]">
            Foxes.ai · Website onboarding
          </p>
          <h2 className="font-display mt-6 text-[26px] sm:text-[30px] font-semibold text-ink leading-tight max-w-[28rem]">
            Your standout local site starts here
          </h2>
          {VSL ? (
            <div className="mt-8 rounded-2xl overflow-hidden border border-white/60 shadow-lg aspect-video bg-ink relative">
              <iframe
                title="Overview"
                src={VSL}
                className="w-full h-full min-h-[200px]"
                allow="fullscreen; autoplay; picture-in-picture"
              />
            </div>
          ) : (
            <p className="mt-6 text-sm text-ink/60">Set `VITE_ONBOARDING_VSL_EMBED_URL` for the welcome reel.</p>
          )}
          <div className="mt-10 rounded-2xl bg-white border border-white/70 shadow-md p-4 max-w-sm">
            <p className="text-xs font-semibold text-ink mb-3">Trusted playbook</p>
            <div className="rounded-xl overflow-hidden bg-onboarding-muted border border-rule p-4 text-[13px] text-muted">
              “Higher-trust creatives on day one—we align visuals and messaging to your market.”
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-h-screen lg:border-l border-rule bg-white relative">
        {step !== 3 && (
          <div className="px-8 pt-8 pb-4 flex gap-4 items-start">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${step >= 1 ? "bg-onboarding-blue text-white" : "bg-onboarding-muted text-muted"}`}
            >
              1
            </span>
            <div className="flex-1 h-[2px] bg-onboarding-muted mt-4" />
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${step >= 2 ? "bg-onboarding-blue text-white" : "bg-onboarding-muted text-muted"}`}
            >
              2
            </span>
          </div>
        )}

        <div className="px-8 pb-24 max-w-xl">
          {step === 1 && (
            <div className="animate-[fadein_.25s_ease]">
              <h1 className="font-display text-[28px] sm:text-[34px] font-semibold text-ink leading-tight">
                Get a refined website built{" "}
                <span className="text-onboarding-blue">before you choose hosting</span>.
              </h1>
              <p className="mt-4 text-[16px] text-ink/70">
                Tell us about your business so we can tailor the build before hosting ever comes up.
              </p>

              <label className="mt-10 block">
                <span className="text-[13px] font-medium text-ink">Business name</span>
                <input
                  className="mt-2 w-full rounded-xl border border-rule px-4 py-3.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-onboarding-blue/30"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your business name as customers know it"
                  autoComplete="organization"
                />
              </label>

              <label className="mt-8 block">
                <span className="text-[13px] font-medium text-ink">Industry / niche</span>
                <input
                  className="mt-2 w-full rounded-xl border border-rule px-4 py-3.5 text-[16px]"
                  value={industryLabel}
                  onChange={(e) => setIndustryLabel(e.target.value)}
                  placeholder="e.g. Boutique dental studio · Retail · Home services"
                  autoComplete="off"
                />
              </label>

              {businessTrimmed && industryTrimmed && (
                <div className="mt-8 rounded-2xl border border-rule shadow-sm bg-white p-5">
                  <p className="text-xs font-semibold text-muted uppercase mb-2">Summary</p>
                  <p className="font-semibold text-lg">{businessTrimmed}</p>
                  <p className="text-[15px] text-muted mt-1">{industryTrimmed}</p>
                </div>
              )}

              <div className="mt-14 flex justify-end">
                <button
                  type="button"
                  disabled={!canContinueStep1}
                  onClick={() => {
                    if (!canContinueStep1) {
                      setError("Add business name and industry.");
                      return;
                    }
                    setError(null);
                    setStep(2);
                  }}
                  className="rounded-full bg-onboarding-blue text-white px-8 py-3.5 font-semibold hover:bg-[#1d4ed8] disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
              {error && <p className="mt-4 text-sm text-amber">{error}</p>}
            </div>
          )}

          {step === 2 && (
            <div className="animate-[fadein_.25s_ease]">
              <h1 className="font-display text-2xl font-semibold">Reserve onboarding</h1>

              <div className="mt-8 rounded-2xl border border-rule shadow-sm p-5 bg-onboarding-muted/30">
                <p className="font-semibold">{businessTrimmed}</p>
                <p className="text-[13px] text-muted mt-1">{industryTrimmed}</p>
              </div>

              <input
                type="text"
                name="website_url"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />

              <label className="mt-8 block text-[13px] font-medium text-muted">
                Full name
                <input
                  className="mt-2 w-full rounded-xl border border-rule px-4 py-3 text-[16px]"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </label>
              <label className="mt-5 block text-[13px] font-medium text-muted">
                Email
                <input
                  type="email"
                  className="mt-2 w-full rounded-xl border border-rule px-4 py-3 text-[16px]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </label>
              {canShowPhone && (
                <label className="mt-5 block text-[13px] font-medium text-muted animate-[fadein_.3s_ease]">
                  Mobile phone (US)
                  <input
                    type="tel"
                    className="mt-2 w-full rounded-xl border border-rule px-4 py-3 text-[16px]"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                  />
                </label>
              )}
              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
              <div className="mt-14 flex gap-4 items-center lg:justify-between fixed bottom-0 left-0 right-0 lg:static bg-white border-t lg:border-0 border-rule px-6 py-4 lg:px-0">
                <button
                  type="button"
                  className="rounded-full px-6 py-3 font-semibold text-[14px] bg-onboarding-muted"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!canSubmitStep2 || pending}
                  onClick={() => submitLead()}
                  className="ml-auto rounded-full bg-onboarding-blue text-white px-8 py-3.5 font-semibold disabled:opacity-40"
                >
                  {pending ? "Saving…" : "Continue →"}
                </button>
              </div>
              <div className="h-24 lg:h-12" aria-hidden />
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col lg:flex-row gap-12 animate-[fadein_.35s_ease]">
              <div className="lg:w-[46%] rounded-2xl border border-rule bg-onboarding-muted/40 p-6">
                {timeline.map((t, i) => (
                  <div key={t.title} className="relative pl-10 pb-8 last:pb-0">
                    <span className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-onboarding-blue text-white text-xs">
                      ✓
                    </span>
                    {i < timeline.length - 1 && (
                      <span className="absolute left-[13px] top-8 bottom-[-8px] w-px bg-onboarding-muted" />
                    )}
                    <p className="font-semibold">{t.title}</p>
                    <p className="text-[13px] text-muted">{t.subtitle}</p>
                  </div>
                ))}
                <div className="mt-2 rounded-xl border border-green-700/25 bg-green-50 px-4 py-3 text-sm font-semibold text-green-900">
                  You&apos;re set!
                </div>
              </div>
              <div className="flex-1">
                <h1 className="font-display text-2xl font-semibold">Next steps</h1>
                <ul className="list-disc pl-5 mt-4 text-muted text-[15px] space-y-2">
                  <li>Watch the rundown below.</li>
                  <li>Stay near your phone—we&apos;ll ping you shortly.</li>
                </ul>
                {CONFIRM_VIDEO ? (
                  <div className="rounded-2xl overflow-hidden border border-rule aspect-video bg-ink mt-8">
                    <iframe
                      title="Next"
                      src={CONFIRM_VIDEO}
                      className="w-full h-full min-h-[220px]"
                      allow="fullscreen; autoplay"
                    />
                  </div>
                ) : (
                  <p className="mt-6 text-muted text-sm">
                    Set `VITE_ONBOARDING_CONFIRM_EMBED_URL` for the follow-up reel.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <a
          href="mailto:patrizio@foxes.ai"
          className="hidden lg:flex absolute bottom-6 right-10 h-12 w-12 rounded-full bg-onboarding-blue text-white shadow-lg items-center justify-center hover:bg-[#1d4ed8]"
          aria-label="Email"
        >
          💬
        </a>
      </main>
    </div>
  );
}
