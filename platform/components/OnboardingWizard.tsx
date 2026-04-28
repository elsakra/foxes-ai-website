"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { MetaPixel } from "./MetaPixel";

type Step = 1 | 2 | 3;

export function OnboardingWizard() {
  const searchParams = useSearchParams();
  const utm = useMemo(
    () => ({
      utm_source: searchParams.get("utm_source") ?? undefined,
      utm_medium: searchParams.get("utm_medium") ?? undefined,
      utm_campaign: searchParams.get("utm_campaign") ?? undefined,
      utm_content: searchParams.get("utm_content") ?? undefined,
    }),
    [searchParams]
  );

  const [step, setStep] = useState<Step>(1);
  const [businessName, setBusinessName] = useState("");
  const [industryLabel, setIndustryLabel] = useState("");
  const [existingWebsiteUrl, setExistingWebsiteUrl] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const vsl = process.env.NEXT_PUBLIC_VSL_EMBED_URL || "";
  const confirmVideo =
    process.env.NEXT_PUBLIC_CONFIRMATION_VIDEO_EMBED_URL || "";

  const businessTrimmed = businessName.trim();
  const industryTrimmed = industryLabel.trim();
  const existingSiteTrimmed = existingWebsiteUrl.trim();
  const canContinueStep1 =
    businessTrimmed.length >= 1 && industryTrimmed.length >= 1;
  const canShowPhone =
    fullName.trim().length > 1 && /\S+@\S+\.\S+/.test(email.trim());
  const canSubmitStep2 = canShowPhone && phone.trim().length >= 8;

  const goStep2 = () => {
    if (!canContinueStep1) {
      setError("Add your business name and industry or niche.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const goBackStep1 = () => {
    setStep(1);
    setError(null);
  };

  const submitLead = () => {
    setError(null);
    if (!canSubmitStep2) {
      setError("Enter a valid mobile number.");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessTrimmed,
          industry: industryTrimmed,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          website: honeypot,
          ...(existingSiteTrimmed ? { existingWebsiteUrl: existingSiteTrimmed } : {}),
          ...utm,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        const flat = (
          j as { error?: Record<string, unknown> | string }
        ).error;
        setError(
          typeof flat === "string"
            ? flat
            : "Something went wrong. Please try again."
        );
        return;
      }
      setStep(3);
      queueMicrotask(() => {
        const w = window as Window & { fbq?: (...a: unknown[]) => void };
        if (typeof w.fbq === "function") w.fbq("track", "Lead");
      });
    });
  };

  const timeline = [
    { title: "Your business", subtitle: "We use what you entered to prep creative direction." },
    { title: "Your contact", subtitle: "We reach you inside 1–2 hours during business hours" },
    {
      title: "Kickoff scheduled",
      subtitle: "We prep your onboarding and site roadmap",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      <MetaPixel />

      {step !== 3 && (
        <aside className="lg:w-[42%] w-full onboarding-gradient lg:min-h-screen flex flex-col">
          <div className="p-8 lg:p-12 flex flex-col flex-1">
            <p className="text-[13px] font-semibold text-onboarding-blue uppercase tracking-[0.12em]">
              Foxes.ai · Website onboarding
            </p>
            <h2 className="font-display mt-6 text-[26px] sm:text-[30px] font-semibold text-ink leading-tight max-w-[28rem]">
              Your standout local site starts here
            </h2>

            {vsl ? (
              <div className="mt-8 rounded-2xl overflow-hidden border border-white/60 shadow-lg aspect-video bg-ink relative">
                <iframe
                  title="Overview video"
                  src={vsl}
                  className="w-full h-full min-h-[200px]"
                  allow="fullscreen; autoplay; picture-in-picture"
                />
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-white/70 bg-white/55 shadow-sm aspect-video flex items-center justify-center px-10 text-center">
                <p className="text-[15px] text-ink/65 leading-snug">
                  Welcome video arrives here—we open with why local sites earn trust fast, then jump into your build.
                </p>
              </div>
            )}

            <div className="mt-10 rounded-2xl bg-white border border-white/70 shadow-md p-4 max-w-sm">
              <p className="text-xs font-semibold text-ink mb-3">Trusted playbook</p>
              <div className="rounded-xl overflow-hidden bg-onboarding-muted border border-rule">
                <div className="p-4 text-[13px] text-muted leading-relaxed">
                  “Higher-trust creatives on day one—we align visuals and messaging to your market.”
                  <span className="block mt-3 text-[12px] text-ink font-medium">
                    Foxes · onboarding experience
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      <main
        className={`flex-1 min-h-screen ${step !== 3 ? "bg-white lg:border-l border-rule" : "bg-gradient-to-b from-slate-50 to-white lg:py-8"}`}
      >
        {step !== 3 && (
          <div className="px-8 pt-8 pb-4 flex gap-4 items-start">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${step >= 1 ? "bg-onboarding-blue text-white" : "bg-onboarding-muted text-muted"}`}
            >
              1
            </span>
            <div className="flex-1 h-[2px] bg-onboarding-muted mt-4" aria-hidden />
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${step >= 2 ? "bg-onboarding-blue text-white" : "bg-onboarding-muted text-muted"}`}
            >
              2
            </span>
          </div>
        )}

        <div
          className={
            step === 3
              ? "px-6 pb-20 pt-6 sm:px-10 lg:pb-28 max-w-3xl mx-auto w-full"
              : "px-8 pb-24 lg:pb-28 max-w-xl"
          }
        >
          {step === 1 && (
            <div className="animate-[fadein_.25s_ease]">
              <h1 className="font-display text-[28px] sm:text-[34px] font-semibold text-ink leading-tight">
                Get a refined website built{" "}
                <span className="text-onboarding-blue">before you choose hosting</span>.
              </h1>
              <p className="mt-4 text-[16px] text-ink/70 leading-relaxed">
                Tell us about your business so we tailor messaging, visuals, and CTAs before we ever pitch hosting.
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
                <span className="text-[13px] font-medium text-ink">
                  Industry / niche
                </span>
                <input
                  className="mt-2 w-full rounded-xl border border-rule px-4 py-3.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-onboarding-blue/30"
                  value={industryLabel}
                  onChange={(e) => setIndustryLabel(e.target.value)}
                  placeholder="e.g. Boutique dental studio · Boutique retail · Home services"
                  autoComplete="off"
                />
                <p className="mt-3 text-[13px] text-muted">
                  A short label is enough—we align details with you before kickoff.
                </p>
              </label>

              <label className="mt-8 block">
                <span className="text-[13px] font-medium text-ink">
                  Current website{" "}
                  <span className="font-normal text-muted">(optional)</span>
                </span>
                <input
                  className="mt-2 w-full rounded-xl border border-rule px-4 py-3.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-onboarding-blue/30"
                  inputMode="url"
                  value={existingWebsiteUrl}
                  onChange={(e) => setExistingWebsiteUrl(e.target.value)}
                  placeholder="https:// or yourbusiness.com"
                  autoComplete="url"
                />
                <p className="mt-3 text-[13px] text-muted">
                  If you already have a site or landing page, paste it here—we use it for inspiration, not to sell hosting.
                </p>
              </label>

              {businessTrimmed && industryTrimmed && (
                <div className="mt-8 rounded-2xl border border-rule shadow-sm bg-white p-5">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                    Summary
                  </p>
                  <p className="font-semibold text-ink text-lg">{businessTrimmed}</p>
                  <p className="text-[15px] text-muted mt-1">{industryTrimmed}</p>
                  {existingSiteTrimmed && (
                    <p className="text-[14px] text-onboarding-blue mt-3 break-all">{existingSiteTrimmed}</p>
                  )}
                </div>
              )}

              <div className="mt-14 flex justify-end">
                <button
                  type="button"
                  disabled={!canContinueStep1}
                  onClick={goStep2}
                  className="rounded-full bg-onboarding-blue text-white px-8 py-3.5 font-semibold text-[15px] hover:bg-[#1d4ed8] disabled:opacity-40 transition-colors"
                >
                  Continue
                </button>
              </div>
              {error && <p className="mt-4 text-sm text-amber">{error}</p>}
              <p className="mt-10 text-[12px] text-center text-muted">
                Hosted + cared for typically from $197/mo once you approve—or walk away free with exported assets when offered.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="animate-[fadein_.25s_ease]">
              <h1 className="font-display text-2xl font-semibold text-ink">
                Reserve your onboarding kickoff
              </h1>
              <p className="mt-2 text-muted text-[15px] leading-relaxed">
                Calls come from an actual strategist—SMS + confirmation email fired automatically.
              </p>

              <div className="mt-8 rounded-2xl border border-rule shadow-sm p-5 bg-onboarding-muted/30">
                <p className="font-semibold text-ink">{businessTrimmed}</p>
                <p className="text-[14px] text-muted mt-1">{industryTrimmed}</p>
                {existingSiteTrimmed ? (
                  <p className="text-[13px] text-onboarding-blue mt-2 break-all">{existingSiteTrimmed}</p>
                ) : null}
              </div>

              <input
                type="text"
                name="website_url"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
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
                    placeholder="(555) 123‑4567"
                  />
                </label>
              )}

              {error && (
                <p className="mt-4 text-sm text-red-600 font-medium" role="alert">
                  {error}
                </p>
              )}

              <div className="mt-14 flex gap-4 items-center lg:justify-between fixed bottom-0 left-0 right-0 lg:static lg:bottom-auto bg-white border-t lg:border-0 border-rule px-6 py-4 lg:px-0">
                <button
                  type="button"
                  className="rounded-full px-6 py-3 font-semibold text-[14px] text-ink bg-onboarding-muted border border-transparent hover:bg-rule/70"
                  onClick={goBackStep1}
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!canSubmitStep2 || pending}
                  onClick={() => void submitLead()}
                  className="ml-auto rounded-full bg-onboarding-blue text-white px-8 py-3.5 font-semibold disabled:opacity-40"
                >
                  {pending ? "Submitting…" : "Continue →"}
                </button>
              </div>
              <div className="h-24 lg:h-12" aria-hidden />
              <p className="text-[12px] text-center lg:text-right text-muted">
                No credit card, repo access retainer, or contract required until you intentionally opt into hosting/tools.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="animate-[fadein_.35s_ease]">
              <div className="rounded-3xl border border-rule bg-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.2)] overflow-hidden">
                <div className="bg-gradient-to-b from-emerald-50/90 to-white px-6 sm:px-10 py-10 sm:py-12 text-center border-b border-rule">
                  <div className="inline-flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-emerald-600 text-white shadow-md ring-4 ring-emerald-600/15">
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="font-display mt-6 text-[clamp(1.6rem,4vw,2rem)] font-semibold text-ink tracking-tight">
                    You&apos;re in
                  </h1>
                  <p className="mt-3 max-w-md mx-auto text-[16px] text-muted leading-relaxed">
                    Your details are saved. We&apos;ll text you shortly to line up your kickoff—keep your phone handy.
                  </p>
                </div>

                <div className="grid divide-y md:divide-y-0 md:divide-x divide-rule bg-rule md:grid-cols-3">
                  {timeline.map((t) => (
                    <div key={t.title} className="bg-white p-5 sm:p-6 text-left">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-onboarding-blue/10 text-onboarding-blue mb-3">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <p className="font-semibold text-[15px] text-ink">{t.title}</p>
                      <p className="mt-1.5 text-[13px] text-muted leading-relaxed">{t.subtitle}</p>
                    </div>
                  ))}
                </div>

                <div className="px-6 sm:px-8 py-8 bg-onboarding-muted/20 border-t border-rule">
                  <h2 className="font-display text-[19px] font-semibold text-ink">What happens next</h2>
                  <ul className="mt-5 space-y-4">
                    {(confirmVideo
                      ? [
                          {
                            label: "Quick video",
                            body: "Catch the short rundown below—we're lining up your project in parallel.",
                          },
                          {
                            label: "Texts & email",
                            body: "SMS and confirmation email are already headed to the number you gave us.",
                          },
                          {
                            label: "Inspiration stash",
                            body: "Note sites, colors, and comps you love—we'll weave them into discovery.",
                          },
                        ]
                      : [
                          {
                            label: "Reach out",
                            body: "Expect a text from our team within about two business hours.",
                          },
                          {
                            label: "Gather ideas",
                            body: "Screenshots, competitors, palettes—we'll cover it on the call; nothing else required right now.",
                          },
                        ]
                    ).map(({ label, body }) => (
                      <li key={label} className="flex gap-4">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-rule text-onboarding-blue shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v6l3 2m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </span>
                        <div>
                          <p className="font-semibold text-[14px] text-ink">{label}</p>
                          <p className="mt-0.5 text-[14px] text-muted leading-relaxed">{body}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {confirmVideo ? (
                  <div className="px-6 sm:px-8 pb-8 pt-0">
                    <div className="rounded-2xl overflow-hidden border border-rule aspect-video bg-ink shadow-inner">
                      <iframe
                        title="What happens next"
                        src={confirmVideo}
                        className="w-full h-full min-h-[220px]"
                        allow="fullscreen; autoplay; picture-in-picture"
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <p className="mt-10 text-center text-[14px] text-muted">
                Questions?{" "}
                <a
                  href="mailto:patrizio@foxes.ai"
                  className="font-medium text-onboarding-blue underline underline-offset-2 hover:text-[#1d4ed8]"
                >
                  patrizio@foxes.ai
                </a>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
