import { useEffect, useMemo, useRef, useState, useTransition } from "react";

const META_PIXEL_ID = import.meta.env.VITE_ONBOARDING_META_PIXEL_ID || import.meta.env.VITE_FUNNEL_META_PIXEL_ID || "";

const VSL = import.meta.env.VITE_ONBOARDING_VSL_EMBED_URL || import.meta.env.VITE_FUNNEL_VSL_EMBED_URL || "";
const CONFIRM_VIDEO =
  import.meta.env.VITE_ONBOARDING_CONFIRM_EMBED_URL ||
  import.meta.env.VITE_ONBOARDING_CONFIRMATION_EMBED_URL ||
  import.meta.env.VITE_FUNNEL_CONFIRMATION_EMBED_URL ||
  "";

function getApiOrigin() {
  const direct = import.meta.env.VITE_ONBOARDING_API_ORIGIN?.replace(/\/$/, "");
  if (direct) return direct;
  const legacy = import.meta.env.VITE_FUNNEL_API_URL || "";
  if (!legacy) return "";
  try {
    return new URL(legacy).origin;
  } catch {
    return "";
  }
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

function deriveIndustry(types) {
  const map = {
    restaurant: "Restaurant",
    food: "Food & beverage",
    store: "Retail",
    dentist: "Dental",
    doctor: "Medical",
    lawyer: "Legal services",
    plumber: "Home services",
    electrician: "Home services",
    gym: "Fitness",
    beauty_salon: "Beauty",
    car_dealer: "Automotive",
    lodging: "Hospitality",
    real_estate_agency: "Real estate",
    general_contractor: "Construction",
    roofing_contractor: "Home services",
  };
  const skip = new Set(["establishment", "point_of_interest", "premise"]);
  for (const t of types) {
    if (!skip.has(t) && map[t]) return map[t];
  }
  for (const t of types) {
    if (!skip.has(t)) return t.replace(/_/g, " ");
  }
  return "";
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
  const [searchInput, setSearchInput] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [showPred, setShowPred] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [place, setPlace] = useState(null);
  const [industryLabel, setIndustryLabel] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();
  const debRef = useRef(null);

  const industryTrimmed = industryLabel.trim();
  const canContinueStep1 = Boolean(place) && industryTrimmed.length >= 1;
  const canShowPhone = fullName.trim().length > 1 && /\S+@\S+\.\S+/.test(email.trim());
  const canSubmitStep2 = canShowPhone && phone.trim().length >= 8;

  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current);
    const q = searchInput.trim();
    if (!apiOrigin || q.length < 2) {
      setPredictions([]);
      return;
    }
    debRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${apiOrigin}/api/places/autocomplete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: q }),
        });
        const j = await res.json();
        setPredictions(j.suggestions ?? []);
        setShowPred(true);
      } catch {
        setPredictions([]);
      }
    }, 280);
    return () => {
      if (debRef.current) clearTimeout(debRef.current);
    };
  }, [searchInput, apiOrigin]);

  const choosePrediction = async (pred) => {
    setShowPred(false);
    setSearchInput(`${pred.primary_text} — ${pred.secondary_text}`);
    if (!apiOrigin) return;
    setDetailLoading(true);
    setPlace(null);
    try {
      const res = await fetch(
        `${apiOrigin}/api/places/details?place_id=${encodeURIComponent(pred.place_id)}`
      );
      const j = await res.json();
      if (!j.place) throw new Error("x");
      setPlace(j.place);
      const hint = deriveIndustry(j.place.secondary_types ?? []);
      setIndustryLabel(hint || "");
    } catch {
      setError("Could not load listing.");
    } finally {
      setDetailLoading(false);
    }
  };

  const photoAbs = place?.photo_url ? `${apiOrigin}${place.photo_url}` : null;

  const submitLead = () => {
    if (!apiOrigin) {
      setError("Set VITE_ONBOARDING_API_ORIGIN to your Next.js origin.");
      return;
    }
    setError(null);
    if (!place || !canSubmitStep2) {
      setError("Enter a valid mobile.");
      return;
    }
    startTransition(async () => {
      const res = await fetch(`${apiOrigin}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: place.display_name,
          industry: industryTrimmed,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          website: honeypot,
          google_place_id: place.place_id,
          place_snapshot: place,
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
    { title: "Location & niche", subtitle: "We verify listing + positioning." },
    { title: "Your contact", subtitle: "We reach you inside 1–2 business hours." },
    { title: "Kickoff", subtitle: "We prep creative + technical roadmap." },
  ];

  if (!apiOrigin) {
    return (
      <div className="min-h-screen bg-white px-8 py-24 max-w-xl mx-auto">
        <p className="text-ink font-display text-xl font-semibold">Almost there</p>
        <p className="mt-4 text-muted text-[15px]">
          Configure <code className="text-sm">VITE_ONBOARDING_API_ORIGIN</code> to your deployed Next.js origin so
          this static page can reach the Places proxy + intake API (or use the hosted{" "}
          <code>/onboarding</code> route).
        </p>
      </div>
    );
  }

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
              <iframe title="Overview" src={VSL} className="w-full h-full min-h-[200px]" allow="fullscreen; autoplay; picture-in-picture" />
            </div>
          ) : (
            <p className="mt-6 text-sm text-ink/60">Set `VITE_ONBOARDING_VSL_EMBED_URL` for the welcome reel.</p>
          )}
          <div className="mt-10 rounded-2xl bg-white border border-white/70 shadow-md p-4 max-w-sm">
            <p className="text-xs font-semibold text-ink mb-3">Trusted playbook</p>
            <div className="rounded-xl overflow-hidden bg-onboarding-muted border border-rule p-4 text-[13px] text-muted">
              “We align your site with how people actually find you on Search + Maps.”
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-h-screen lg:border-l border-rule bg-white relative">
        {step !== 3 && (
          <div className="px-8 pt-8 pb-4 flex gap-4 items-start">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${step >= 1 ? "bg-onboarding-blue text-white" : "bg-onboarding-muted text-muted"}`}>
              1
            </span>
            <div className="flex-1 h-[2px] bg-onboarding-muted mt-4" />
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${step >= 2 ? "bg-onboarding-blue text-white" : "bg-onboarding-muted text-muted"}`}>
              2
            </span>
          </div>
        )}

        <div className="px-8 pb-24 max-w-xl">
          {step === 1 && (
            <div className="animate-[fadein_.25s_ease]">
              <h1 className="font-display text-[28px] sm:text-[34px] font-semibold text-ink leading-tight">
                Get a refined website built <span className="text-onboarding-blue">before you choose hosting</span>.
              </h1>
              <p className="mt-4 text-[16px] text-ink/70">Find your Google listing so we mirror how customers discover you.</p>

              <label className="mt-10 block">
                <span className="text-[13px] font-medium text-ink">Find your business (as listed on Google)</span>
                <div className="relative mt-2">
                  <input
                    className="w-full rounded-xl border border-rule px-4 py-3.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-onboarding-blue/30"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      setPlace(null);
                      setShowPred(true);
                    }}
                    onFocus={() => setShowPred(true)}
                    placeholder="Enter your business name"
                    autoComplete="off"
                  />
                  {showPred && predictions.length > 0 && (
                    <ul className="absolute z-40 mt-2 w-full rounded-xl border border-rule bg-white shadow-xl max-h-56 overflow-auto">
                      {predictions.map((p) => (
                        <li key={p.place_id}>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-3 hover:bg-onboarding-muted/60 text-[14px]"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => void choosePrediction(p)}
                          >
                            <span className="font-medium text-ink block">{p.primary_text}</span>
                            <span className="text-muted text-[13px]">{p.secondary_text}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </label>

              {detailLoading && <p className="mt-4 text-sm text-muted">Loading…</p>}

              {place && (
                <>
                  <div className="mt-8 rounded-2xl border border-rule shadow-sm bg-white flex gap-4 p-4">
                    <div className="w-[84px] h-[84px] shrink-0 rounded-lg bg-rule overflow-hidden">
                      {photoAbs ? (
                        <img src={photoAbs} alt="" width={84} height={84} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-[11px] text-muted px-1 text-center">
                          —
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{place.display_name}</p>
                      {place.rating != null && (
                        <p className="text-[13px] text-amber-700 font-medium mt-1">
                          {place.rating}★ {place.user_ratings_total != null && `(${place.user_ratings_total})`}
                        </p>
                      )}
                      <p className="text-[13px] text-muted mt-1 leading-snug">{place.formatted_address}</p>
                    </div>
                  </div>

                  <label className="mt-8 block text-[13px] font-medium text-muted">
                    Industry / niche label
                    <input
                      className="mt-2 w-full rounded-xl border border-rule px-4 py-3 text-[16px]"
                      value={industryLabel}
                      onChange={(e) => setIndustryLabel(e.target.value)}
                      placeholder="e.g. Boutique dental studio"
                    />
                  </label>
                </>
              )}

              <div className="mt-14 flex justify-end">
                <button
                  type="button"
                  disabled={!canContinueStep1}
                  onClick={() => {
                    if (!canContinueStep1) {
                      setError("Pick a listing + niche.");
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
              {place && (
                <div className="mt-8 rounded-2xl border border-rule shadow-sm p-5 flex gap-4">
                  <div className="w-[72px] h-[72px] rounded-lg bg-rule overflow-hidden">
                    {photoAbs && (
                      <img src={photoAbs} alt="" width={72} height={72} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold">{place.display_name}</p>
                    <p className="text-[13px] text-muted">{place.formatted_address}</p>
                  </div>
                </div>
              )}
              <input type="text" name="website_url" className="hidden" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />

              <label className="mt-8 block text-[13px] font-medium text-muted">
                Full name
                <input className="mt-2 w-full rounded-xl border border-rule px-4 py-3 text-[16px]" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
              </label>
              <label className="mt-5 block text-[13px] font-medium text-muted">
                Email
                <input type="email" className="mt-2 w-full rounded-xl border border-rule px-4 py-3 text-[16px]" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
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
                <button type="button" className="rounded-full px-6 py-3 font-semibold text-[14px] bg-onboarding-muted" onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="button" disabled={!canSubmitStep2 || pending} onClick={() => submitLead()} className="ml-auto rounded-full bg-onboarding-blue text-white px-8 py-3.5 font-semibold disabled:opacity-40">
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
                    <span className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-onboarding-blue text-white text-xs">✓</span>
                    {i < timeline.length - 1 && <span className="absolute left-[13px] top-8 bottom-[-8px] w-px bg-onboarding-muted" />}
                    <p className="font-semibold">{t.title}</p>
                    <p className="text-[13px] text-muted">{t.subtitle}</p>
                  </div>
                ))}
                <div className="mt-2 rounded-xl border border-green-700/25 bg-green-50 px-4 py-3 text-sm font-semibold text-green-900">You&apos;re set!</div>
              </div>
              <div className="flex-1">
                <h1 className="font-display text-2xl font-semibold">Next steps</h1>
                <ul className="list-disc pl-5 mt-4 text-muted text-[15px] space-y-2">
                  <li>Watch the rundown below.</li>
                  <li>Stay near your phone—we&apos;ll ping you shortly.</li>
                </ul>
                {CONFIRM_VIDEO ? (
                  <div className="rounded-2xl overflow-hidden border border-rule aspect-video bg-ink mt-8">
                    <iframe title="Next" src={CONFIRM_VIDEO} className="w-full h-full min-h-[220px]" allow="fullscreen; autoplay" />
                  </div>
                ) : (
                  <p className="mt-6 text-muted text-sm">Set `VITE_ONBOARDING_CONFIRM_EMBED_URL` for the follow-up reel.</p>
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
