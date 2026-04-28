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

      <main className="flex-1 min-h-screen lg:border-l border-rule bg-white">
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

        <div className="px-8 pb-24 lg:pb-28 max-w-xl">
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
            <div className="flex flex-col lg:flex-row gap-12 animate-[fadein_.35s_ease]">
              <div className="lg:w-[46%]">
                <div className="rounded-2xl border border-rule bg-onboarding-muted/40 p-6">
                  {timeline.map((t, i) => (
                    <div key={t.title} className="relative pl-10 pb-8 last:pb-0">
                      <span className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-onboarding-blue text-white text-xs font-bold">
                        ✓
                      </span>
                      {i < timeline.length - 1 && (
                        <span className="absolute left-[13px] top-8 bottom-[-8px] w-px bg-onboarding-muted" />
                      )}
                      <p className="font-semibold text-ink">{t.title}</p>
                      <p className="text-[13px] text-muted leading-relaxed">{t.subtitle}</p>
                    </div>
                  ))}
                  <div className="mt-2 rounded-xl border border-green-700/25 bg-green-50 px-4 py-3">
                    <p className="text-sm font-semibold text-green-900">You&apos;re set!</p>
                    <p className="text-[13px] text-green-900/80 mt-1">
                      Patrizio&apos;s desk is alerted—we&apos;ll ping you shortly to finalize creative lanes.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-5">
                <h1 className="font-display text-2xl font-semibold text-ink leading-snug">
                  Here&apos;s what happens next
                </h1>
                {confirmVideo ? (
                  <>
                    <ul className="list-disc pl-5 text-[15px] text-muted space-y-2">
                      <li>Watch the short rundown below while we tee up onboarding.</li>
                      <li>Keep your phone nearby—we route SMS + email automatically.</li>
                      <li>Pull inspiration: comps, rivals to avoid, palettes, screenshots.</li>
                    </ul>
                    <div className="rounded-2xl overflow-hidden border border-rule aspect-video bg-ink mt-8">
                      <iframe
                        title="What happens next"
                        src={confirmVideo}
                        className="w-full h-full min-h-[240px]"
                        allow="fullscreen; autoplay; picture-in-picture"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <ul className="list-disc pl-5 text-[15px] text-muted space-y-2">
                      <li>We&apos;ll reach out shortly—watch for a text from our team.</li>
                      <li>Keep ideas handy: comps, colors, and sites you admire (your notes are saved with this lead).</li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
