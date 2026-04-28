"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { MetaPixel } from "./MetaPixel";

type Step = 1 | 2 | 3;

export function FunnelWizard() {
  const search = useSearchParams();
  const utm = useMemo(
    () => ({
      utm_source: search.get("utm_source") ?? undefined,
      utm_medium: search.get("utm_medium") ?? undefined,
      utm_campaign: search.get("utm_campaign") ?? undefined,
      utm_content: search.get("utm_content") ?? undefined,
    }),
    [search]
  );

  const [step, setStep] = useState<Step>(1);
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const vsl = process.env.NEXT_PUBLIC_VSL_EMBED_URL || "";
  const confirmVideo =
    process.env.NEXT_PUBLIC_CONFIRMATION_VIDEO_EMBED_URL || "";

  const canShowPhone = fullName.trim().length > 1 && /\S+@\S+\.\S+/.test(email);

  const goStep2 = () => {
    if (!businessName.trim() || !industry.trim()) {
      setError("Add your business name and industry.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const goStep3 = async () => {
    setError(null);
    if (!canShowPhone || phone.trim().length < 8) {
      setError("Enter a valid phone number.");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          industry: industry.trim(),
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          website: honeypot,
          ...utm,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError((j as { error?: string }).error || "Something went wrong.");
        return;
      }
      setStep(3);
      queueMicrotask(() => {
        const w = window as Window & { fbq?: (...a: unknown[]) => void };
        if (typeof w.fbq === "function") {
          w.fbq("track", "Lead");
        }
      });
    });
  };

  return (
    <div className="grain min-h-screen">
      <MetaPixel />
      <div className="max-w-lg mx-auto px-6 pt-12 pb-24">
        <p className="text-[13px] font-semibold text-forest uppercase tracking-[0.14em]">
          Foxes.ai · Free website build
        </p>
        <h1 className="font-display mt-4 text-[30px] sm:text-[38px] font-semibold text-ink leading-tight balance">
          Local businesses deserve a stunning site — we build yours before you pay anything.
        </h1>
        <p className="mt-4 text-[17px] text-ink/70 leading-snug pretty">
          Opt in below. We&apos;ll call within <strong className="text-ink">1–2 hours</strong>{" "}
          for a fast kickoff (~5 minutes). Site preview in{" "}
          <strong className="text-ink">~48 hours</strong>. Prefer DIY after? We hand off the code.
        </p>

        {vsl ? (
          <div className="mt-8 rounded-xl overflow-hidden border border-rule shadow-lg aspect-video bg-white">
            <iframe
              title="Video overview"
              src={vsl}
              className="w-full h-full min-h-[200px]"
              allow="fullscreen; autoplay; picture-in-picture"
            />
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted italic">
            Set NEXT_PUBLIC_VSL_EMBED_URL to your Vimeo iframe URL.
          </p>
        )}

        <div className="mt-10 rounded-2xl border border-rule bg-white p-6 shadow-sm">
          {step === 1 && (
            <>
              <h2 className="font-display text-xl font-semibold">Step 1 — Your business</h2>
              <label className="mt-6 block text-[13px] font-medium text-muted">
                Business name
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-rule px-3 py-2.5 text-[16px]"
                  autoComplete="organization"
                  placeholder="Tony's HVAC"
                />
              </label>
              <label className="mt-5 block text-[13px] font-medium text-muted">
                Industry
                <input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-rule px-3 py-2.5 text-[16px]"
                  autoComplete="on"
                  placeholder="Home services, dentistry, boutique…"
                />
              </label>
              <button
                type="button"
                onClick={goStep2}
                className="mt-8 w-full rounded-full bg-amber py-3.5 text-[16px] font-semibold text-white hover:bg-[#B4471A] transition-colors"
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-display text-xl font-semibold">Step 2 — How we reach you</h2>
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />
              <label className="mt-6 block text-[13px] font-medium text-muted">
                Full name
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-rule px-3 py-2.5 text-[16px]"
                  autoComplete="name"
                />
              </label>
              <label className="mt-5 block text-[13px] font-medium text-muted">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-rule px-3 py-2.5 text-[16px]"
                  autoComplete="email"
                />
              </label>
              {canShowPhone && (
                <label className="mt-5 block text-[13px] font-medium text-muted animate-[fadein_.3s_ease]">
                  Mobile phone
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-rule px-3 py-2.5 text-[16px]"
                    autoComplete="tel"
                    placeholder="(555) 123-4567"
                  />
                </label>
              )}
              <p className="mt-4 text-[13px] text-muted leading-relaxed">
                After we have your number:{" "}
                <span className="text-ink/80">
                  Got it. We&apos;ll call you within 1-2 hours for a quick 5-minute kickoff. Have
                  your business info handy — services you offer, who your customers are, and any
                  websites you like the look of. We respect your time and never make spam calls.
                </span>
              </p>
              <button
                type="button"
                disabled={!canShowPhone || pending}
                onClick={() => void goStep3()}
                className="mt-8 w-full rounded-full bg-forest py-3.5 text-[16px] font-semibold text-cream hover:bg-forest/90 transition-colors disabled:opacity-40"
              >
                {pending ? "Submitting…" : "Done — notify the team"}
              </button>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-6">
              <h2 className="font-display text-2xl font-semibold">
                You&apos;re in. Watch this while we call you soon.
              </h2>
              <p className="mt-3 text-muted text-[15px] leading-relaxed">
                Squad speed-to-lead: first touch within ~1–2 hours on business hours.
              </p>
              {confirmVideo ? (
                <div className="mt-8 rounded-xl overflow-hidden border border-rule aspect-video">
                  <iframe
                    title="What happens next"
                    src={confirmVideo}
                    className="w-full h-full min-h-[220px]"
                    allow="fullscreen; autoplay"
                  />
                </div>
              ) : (
                <p className="mt-6 text-sm text-muted">
                  Paste NEXT_PUBLIC_CONFIRMATION_VIDEO_EMBED_URL for Patrizio&apos;s follow-up clip.
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="mt-4 text-[14px] text-amber font-medium">{error}</p>
          )}
        </div>

        <p className="mt-10 text-[12px] text-center text-muted">
          Hosted + maintained from{" "}
          <span className="text-ink font-semibold">$197/mo</span> typical — or take the export and
          run DIY. No upfront build fee when you qualify.
        </p>
      </div>
    </div>
  );
}
