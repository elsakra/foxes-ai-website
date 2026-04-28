import { useEffect, useMemo, useState, useTransition } from "react";

const API_URL = import.meta.env.VITE_FUNNEL_API_URL || "";
const VSL = import.meta.env.VITE_FUNNEL_VSL_EMBED_URL || "";
const CONFIRM_VIDEO = import.meta.env.VITE_FUNNEL_CONFIRMATION_EMBED_URL || "";
const META_PIXEL_ID = import.meta.env.VITE_FUNNEL_META_PIXEL_ID || "";

function useUtmFromUrl() {
  return useMemo(() => {
    if (typeof window === "undefined") {
      return {
        utm_source: undefined,
        utm_medium: undefined,
        utm_campaign: undefined,
        utm_content: undefined,
      };
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
    if (document.getElementById(`fb-pixel-vite-${META_PIXEL_ID}`)) return;
    const s = document.createElement("script");
    s.id = `fb-pixel-vite-${META_PIXEL_ID}`;
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

function checkoutHref(leadId) {
  if (!API_URL || !leadId) return null;
  try {
    const u = new URL(API_URL);
    u.pathname = u.pathname.replace(/\/?api\/leads\/?$/i, "/") || "/";
    if (!u.pathname.endsWith("/")) u.pathname += "/";
    return `${u.origin}${u.pathname.replace(/\/$/, "")}/checkout/${leadId}`;
  } catch {
    return null;
  }
}

export default function FoxesFunnel() {
  const utm = useUtmFromUrl();
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState(null);
  const [leadId, setLeadId] = useState(null);
  const [pending, startTransition] = useTransition();

  const canShowPhone = fullName.trim().length > 1 && /\S+@\S+\.\S+/.test(email);

  const goStep2 = () => {
    if (!businessName.trim() || !industry.trim()) {
      setError("Add your business name and industry.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const submitLead = () => {
    setError(null);
    if (!canShowPhone || phone.trim().length < 8) {
      setError("Enter a valid phone number.");
      return;
    }
    if (!API_URL) {
      setError("Configure VITE_FUNNEL_API_URL (your Next.js /api/leads URL).");
      return;
    }
    startTransition(async () => {
      const res = await fetch(API_URL, {
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
      let j = {};
      try {
        j = await res.json();
      } catch {
        /* ignore */
      }
      if (!res.ok) {
        setError(typeof j?.error === "string" ? j.error : "Something went wrong.");
        return;
      }
      const id = j.leadId;
      setLeadId(id);
      setStep(3);
      queueMicrotask(() => {
        if (typeof window.fbq === "function") {
          window.fbq("track", "Lead");
        }
      });
    });
  };

  const payUrl = checkoutHref(leadId);

  return (
    <div className="grain min-h-screen">
      <MetaPixelLoader />
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

        {VSL ? (
          <div className="mt-8 rounded-xl overflow-hidden border border-rule shadow-lg aspect-video bg-white">
            <iframe
              title="Video overview"
              src={VSL}
              className="w-full h-full min-h-[200px]"
              allow="fullscreen; autoplay; picture-in-picture"
            />
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted italic">
            Set <code className="text-ink font-mono text-[13px]">VITE_FUNNEL_VSL_EMBED_URL</code>{" "}
            to your Vimeo or YouTube iframe URL.
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
                onClick={() => void submitLead()}
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
              {CONFIRM_VIDEO ? (
                <div className="mt-8 rounded-xl overflow-hidden border border-rule aspect-video">
                  <iframe
                    title="What happens next"
                    src={CONFIRM_VIDEO}
                    className="w-full h-full min-h-[220px]"
                    allow="fullscreen; autoplay"
                  />
                </div>
              ) : (
                <p className="mt-6 text-sm text-muted">
                  Set <code className="font-mono text-[13px]">VITE_FUNNEL_CONFIRMATION_EMBED_URL</code>{" "}
                  for a follow-up clip.
                </p>
              )}
              {payUrl && (
                <a
                  href={payUrl}
                  className="mt-8 inline-flex items-center justify-center w-full rounded-full bg-amber py-3.5 text-[16px] font-semibold text-white hover:bg-[#B4471A] transition-colors"
                >
                  Continue to checkout
                </a>
              )}
            </div>
          )}

          {error && <p className="mt-4 text-[14px] text-amber font-medium">{error}</p>}
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
