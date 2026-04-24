const { useState, useEffect, useRef } = React;

const PATRIZIO_PHOTO = "patrizio-20bio.avif";

// ————————————————————————————————————————————————————
// Icons
// ————————————————————————————————————————————————————
const Check = ({ className = "" }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path d="M4.5 10.5l3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const X = ({ className = "" }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);
const ArrowRight = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Plus = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);
const Play = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M8 5.5v13l11-6.5z" />
  </svg>
);
const SoundOff = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4 9v6h4l5 4V5L8 9H4zM16 9l4 6M20 9l-4 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Star = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.9L5.7 21l1.7-7L2 9.5l7.1-.6L12 2z" />
  </svg>
);
const Shield = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Clock = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

const AmberCheck = () => (
  <span className="inline-flex shrink-0 items-center justify-center w-6 h-6 rounded-full bg-amber text-white mt-0.5">
    <Check className="w-3.5 h-3.5" />
  </span>
);

// ————————————————————————————————————————————————————
// Top announcement bar (urgency)
// ————————————————————————————————————————————————————
const AnnouncementBar = () => {
  const [slots, setSlots] = useState(3);
  return (
    <div className="bg-forest text-cream">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-10 flex items-center justify-center gap-3 text-[13px]">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-amber opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber" />
        </span>
        <span className="text-cream/90">
          <span className="font-medium text-cream">Booking for April</span>
          <span className="hidden sm:inline text-cream/60"> · </span>
          <span className="hidden sm:inline">Only <span className="font-semibold text-amber">{slots} design slots</span> left this week</span>
        </span>
      </div>
    </div>
  );
};

// ————————————————————————————————————————————————————
// Scroll progress bar
// ————————————————————————————————————————————————————
const ScrollProgress = () => {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[60] pointer-events-none">
      <div className="h-full bg-amber scroll-bar" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
};

// ————————————————————————————————————————————————————
// Header
// ————————————————————————————————————————————————————
const Header = () => (
  <header className="relative z-40 border-b border-rule bg-cream/80 backdrop-blur-sm sticky top-0">
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
      <a href="/" className="flex items-center gap-2 group">
        <span className="text-xl leading-none">🦊</span>
        <span className="font-display font-semibold text-[20px] tracking-tight">Foxes<span className="text-amber">.</span>ai</span>
      </a>
      <div className="hidden sm:flex items-center gap-5">
        <a href="/" className="text-[14px] font-medium text-muted hover:text-ink transition-colors link-u">Home</a>
        <a href="#" className="inline-flex items-center gap-2 text-[14px] text-muted hover:text-ink transition-colors">
          Text <span className="text-ink font-medium">(615) 555‑0142</span>
        </a>
        <a href="#book" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-ink text-cream text-[13px] font-semibold hover:bg-amber transition-colors">
          Book free call
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  </header>
);

// ————————————————————————————————————————————————————
// Calendly embed — real, live
// ————————————————————————————————————————————————————
const CALENDLY_URL = "https://calendly.com/patrizio-foxes/30min?back=1&hide_gdpr_banner=1&primary_color=C9531E&text_color=0A0A0A&background_color=FFFFFF";

const CalendlyEmbed = ({ height = 680 }) => (
  <div className="rounded-xl overflow-hidden border border-rule bg-white">
    <iframe
      src={CALENDLY_URL}
      width="100%"
      height={height}
      frameBorder="0"
      title="Book a call with Patrizio"
      loading="lazy"
      style={{ minHeight: height, display: "block" }}
    />
  </div>
);

// ————————————————————————————————————————————————————
// Booking card (now with Calendly, framed with trust elements)
// ————————————————————————————————————————————————————
const BookingCard = () => (
  <div id="book" className="bg-white border border-rule rounded-2xl card-shadow-lg overflow-hidden">
    {/* header */}
    <div className="px-7 pt-7 pb-5 bg-cream border-b border-rule">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-forest uppercase tracking-[0.14em]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-forest opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-forest" />
          </span>
          Live availability
        </div>
        <div className="text-[12px] text-muted">
          <span className="text-ink font-medium tnum">20 min</span> · Zoom
        </div>
      </div>
      <h3 className="mt-3 font-display font-semibold text-[24px] sm:text-[26px] display-tight">
        Pick a time. See your site on the call.
      </h3>
      <ul className="mt-4 space-y-1.5 text-[14px] text-ink/75">
        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-forest shrink-0" /> We design it <em className="italic">before</em> we meet</li>
        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-forest shrink-0" /> No credit card, no pressure, no catch</li>
        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-forest shrink-0" /> Walk away with the code if you pass</li>
      </ul>
    </div>
    {/* calendly */}
    <div className="p-3 sm:p-4">
      <CalendlyEmbed height={680} />
    </div>
    {/* footer trust */}
    <div className="px-7 py-4 bg-cream border-t border-rule flex items-center justify-between gap-4 text-[12px] text-muted">
      <div className="inline-flex items-center gap-1.5">
        <Shield className="w-4 h-4 text-forest" />
        <span>100% free — nothing to cancel</span>
      </div>
      <div className="inline-flex items-center gap-1.5">
        <span className="font-medium text-ink tnum">4.9</span>
        <div className="flex gap-0.5 text-amber">
          {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3" />)}
        </div>
      </div>
    </div>
  </div>
);

// ————————————————————————————————————————————————————
// Live activity ticker (social proof)
// ————————————————————————————————————————————————————
const LiveActivity = () => {
  const events = [
    { who: "Maria from Austin", what: "just booked a call", when: "2 min ago" },
    { who: "Napule (Nashville)", what: "went live today", when: "1 hr ago" },
    { who: "James from Denver", what: "just booked a call", when: "18 min ago" },
    { who: "Living Waters Yoga", what: "new site delivered", when: "3 hr ago" },
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % events.length), 3800);
    return () => clearInterval(t);
  }, []);
  const e = events[i];
  return (
    <div className="inline-flex items-center gap-3 px-4 h-10 rounded-full bg-white border border-rule text-[13px]">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-forest opacity-60 animate-ping" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-forest" />
      </span>
      <span key={i} className="text-ink/80 animate-[fadein_.4s_ease]">
        <span className="font-medium text-ink">{e.who}</span> {e.what} <span className="text-muted">· {e.when}</span>
      </span>
    </div>
  );
};

// ————————————————————————————————————————————————————
// Hero
// ————————————————————————————————————————————————————
const Hero = () => {
  const [muted, setMuted] = useState(true);
  return (
    <section id="top" className="relative grain">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-12 sm:pt-16 lg:pt-20 pb-20 lg:pb-28">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 xl:gap-20 items-start">
          {/* LEFT */}
          <div>
            <div className="mb-6">
              <LiveActivity />
            </div>

            <h1 className="font-display font-semibold text-[44px] sm:text-[56px] lg:text-[68px] xl:text-[76px] display-tight balance text-ink">
              We'll design your new website <em className="italic font-normal text-amber">before</em> our first call.
            </h1>

            <p className="mt-7 text-[19px] sm:text-[22px] leading-[1.55] text-ink/75 pretty max-w-[600px]">
              Book 20 minutes. When we hop on Zoom, your site is already built. If you love it — it's yours. If not — take the code and walk. <span className="text-ink font-medium">Either way, you pay nothing.</span>
            </p>

            {/* Price anchor chip */}
            <div className="mt-8 inline-flex items-center gap-3 text-[14px]">
              <span className="px-3 h-8 inline-flex items-center rounded-full bg-ink/5 border border-rule text-muted line-through decoration-amber decoration-2 tnum">Agencies: $6,000–$15,000</span>
              <ArrowRight className="w-4 h-4 text-muted" />
              <span className="px-3 h-8 inline-flex items-center rounded-full bg-forest text-cream font-semibold tnum">$0 to see yours</span>
            </div>

            {/* Video placeholder — Patrizio photo under forest wash */}
            <div className="mt-10 relative rounded-2xl overflow-hidden border border-rule card-shadow">
              <div className="aspect-video relative">
                <img
                  src={PATRIZIO_PHOTO}
                  alt="Patrizio Murdocca"
                  width={1280}
                  height={720}
                  className="absolute inset-0 w-full h-full object-cover object-[center_15%]"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-forest/92 via-forest/82 to-[#15301f]/92" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="group w-20 h-20 rounded-full bg-cream text-forest flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
                    <Play className="w-7 h-7 translate-x-0.5" />
                  </button>
                </div>
                <button
                  onClick={() => setMuted((m) => !m)}
                  className="absolute left-4 bottom-4 inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-black/50 backdrop-blur text-cream text-[13px] font-medium hover:bg-black/70 transition-colors"
                >
                  <SoundOff className="w-4 h-4" />
                  {muted ? "Unmute" : "Mute"}
                </button>
                <div className="absolute right-4 bottom-4 text-[12px] text-cream/80 font-medium tnum">0:47 / 1:58</div>
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 text-[12px] text-cream/90 eyebrow uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
                  Founder intro — 1 min
                </div>
              </div>
            </div>
            <p className="mt-4 italic text-[15px] text-muted max-w-[520px]">
              "I'm Patrizio. I've built 250+ sites. Let me show you what yours could look like."
            </p>

            {/* Stat row */}
            <div className="mt-12 grid grid-cols-3 divide-x divide-rule border-y border-rule py-8">
              <Stat big="250+" label="sites delivered" />
              <Stat big="47 min" label="avg. build time" />
              <Stat big="$0" label="to see yours" />
            </div>

            {/* Bullet checklist */}
            <ul className="mt-10 space-y-4">
              {[
                <>Your site is <em className="italic">designed, built, and live-previewed</em> before we talk</>,
                <>Love it? <span className="font-semibold">$99/mo</span> — hosting, domain, email, booking, SEO, everything</>,
                <>Don't love it? Take the code. No cost. No contract. No weirdness.</>,
                <>20 minutes on Zoom. No slide decks. No "discovery". Just your site.</>,
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-[17px] text-ink/85">
                  <AmberCheck />
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            {/* Guarantee strip */}
            <div className="mt-10 flex items-start gap-4 p-5 rounded-xl bg-forest/5 border border-forest/15">
              <Shield className="w-6 h-6 text-forest shrink-0 mt-0.5" />
              <div>
                <div className="font-display font-semibold text-[18px] text-ink">Our "Walk Away" guarantee</div>
                <div className="mt-1 text-[14px] text-ink/70">If you hate the design, walk. Keep the code. We'll even give you a 15‑min help call to deploy it elsewhere. Seriously.</div>
              </div>
            </div>
          </div>

          {/* RIGHT — Calendly booking */}
          <div className="lg:sticky lg:top-24">
            <BookingCard />
            <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-muted">
              <Clock className="w-3.5 h-3.5" />
              <span>Next availability: <span className="text-ink font-medium">Tomorrow, 10:00 AM CT</span></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Stat = ({ big, label }) => (
  <div className="px-4 first:pl-0 last:pr-0 text-center first:text-left last:text-right">
    <div className="font-display font-semibold display-tight text-ink text-[36px] sm:text-[42px] lg:text-[48px] tnum">
      {big}
    </div>
    <div className="mt-2 text-[12px] sm:text-[13px] font-medium text-muted eyebrow uppercase tracking-[0.1em]">
      {label}
    </div>
  </div>
);

// ————————————————————————————————————————————————————
// Trust bar
// ————————————————————————————————————————————————————
const TrustBar = () => {
  const clients = ["Pool Bidder", "Margaritas.ai", "May Construction", "Animated Medical", "SC Law Center"];
  return (
    <section className="bg-cream-2 border-y border-rule">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10 lg:py-12">
        <p className="text-center text-[12px] font-medium text-muted uppercase tracking-[0.18em] mb-7">
          Trusted by 250+ local businesses — from Nashville to Denver
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-4">
          {clients.map((c) => (
            <div key={c} className="flex items-center justify-center h-10">
              <span className="font-display font-semibold text-[17px] text-ink/55 hover:text-ink/80 transition-colors whitespace-nowrap">
                {c}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ————————————————————————————————————————————————————
// Testimonials
// ————————————————————————————————————————————————————
const Testimonial = ({ quote, name, role, result, tone = "cream" }) => (
  <div className={`rounded-2xl p-8 border flex flex-col ${tone === "dark" ? "bg-forest text-cream border-forest" : "bg-white border-rule"}`}>
    <div className="flex gap-1 text-amber mb-5">
      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4" />)}
    </div>
    <p className={`font-display text-[22px] lg:text-[24px] display-tight leading-[1.25] balance flex-1 ${tone === "dark" ? "text-cream" : "text-ink"}`}>
      "{quote}"
    </p>
    <div className={`mt-6 pt-5 border-t ${tone === "dark" ? "border-cream/15" : "border-rule"}`}>
      <div className={`flex items-center justify-between gap-4`}>
        <div>
          <div className={`font-semibold text-[15px] ${tone === "dark" ? "text-cream" : "text-ink"}`}>{name}</div>
          <div className={`text-[13px] ${tone === "dark" ? "text-cream/60" : "text-muted"}`}>{role}</div>
        </div>
        {result && (
          <div className={`text-right text-[12px] uppercase tracking-[0.12em] font-semibold ${tone === "dark" ? "text-amber" : "text-amber"}`}>
            {result}
          </div>
        )}
      </div>
    </div>
  </div>
);

const Testimonials = () => (
  <section className="py-24 lg:py-28 bg-cream">
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
      <div className="max-w-[720px] mb-14">
        <div className="eyebrow uppercase text-[13px] font-semibold text-amber tracking-[0.12em] mb-5">Real owners, real results</div>
        <h2 className="font-display font-semibold text-[40px] sm:text-[48px] display-tight balance">
          People keep texting us after their call.
        </h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Testimonial
          tone="dark"
          quote="I showed up thinking I'd get a pitch. Instead I got a website. I literally said yes on the call."
          name="Tony D."
          role="Owner, Napule (Nashville)"
          result="+38% bookings / mo"
        />
        <Testimonial
          quote="My old site hadn't been touched since 2016. Patrizio had a new one ready in an hour. An hour."
          name="Rachel K."
          role="Living Waters Yoga"
          result="Live in 1 day"
        />
        <Testimonial
          quote="The fact that I could walk with the code made it a no-brainer to just take the call. I stayed for the $99."
          name="Marcus T."
          role="HV Urban Development"
          result="Hosts with us"
        />
      </div>
    </div>
  </section>
);

// ————————————————————————————————————————————————————
// Portfolio (fixed set of live sites — live iframe preview + full-card link)
// ————————————————————————————————————————————————————
const PORTFOLIO_SITES = [
  { url: "https://poolbidder.com", label: "Pool Bidder", tag: "Marketplace" },
  { url: "https://margaritas.ai", label: "Margaritas.ai", tag: "Hospitality & AI" },
  { url: "https://may.construction", label: "May Construction", tag: "Construction" },
  { url: "https://animatedmedical.com", label: "Animated Medical", tag: "Healthcare" },
  { url: "https://sclawcenter.com", label: "SC Law Center", tag: "Legal" },
];

const PortfolioPreviewCard = ({ url, label, tag }) => {
  const href = url.replace(/\/$/, "");
  let host = "";
  try {
    host = new URL(href).hostname.replace(/^www\./, "");
  } catch {
    host = href;
  }
  return (
    <article className="group relative">
      <div className="rounded-2xl overflow-hidden border border-rule bg-white card-shadow transition-all duration-300 group-hover:-translate-y-1 group-hover:card-shadow-lg">
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-rule bg-gradient-to-b from-cream to-cream-2">
          <span className="flex gap-1.5 shrink-0" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E8A09A]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#E6C04A]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#61C454]" />
          </span>
          <div className="flex-1 min-w-0 flex justify-center">
            <div className="flex items-center gap-2 max-w-full rounded-lg bg-white/90 border border-rule/80 px-3 py-1 shadow-[0_1px_0_rgba(10,10,10,0.04)]">
              <span className="text-muted/80" aria-hidden="true">
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="none">
                  <path d="M8 2.5l5.5 3v5L8 13.5 2.5 10.5v-5L8 2.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-[11px] sm:text-[12px] font-mono text-ink/65 truncate tabular-nums">{host}</span>
            </div>
          </div>
          <span className="w-8 shrink-0" aria-hidden="true" />
        </div>

        <div className="relative h-[220px] sm:h-[260px] lg:h-[240px] overflow-hidden bg-[#ECEAE6]">
          <div
            className="absolute left-1/2 top-0 w-[1280px] max-w-[220%] origin-top"
            style={{ height: 820, transform: "translateX(-50%) scale(0.38)" }}
          >
            <iframe
              src={href}
              title={`${label} live preview`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              tabIndex={-1}
              className="w-full h-full border-0 bg-white pointer-events-none"
            />
          </div>
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream/25"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-cream/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-hidden="true"
          />
        </div>

        <div className="px-4 sm:px-5 py-4 border-t border-rule bg-cream">
          <div className="text-[11px] font-semibold text-amber uppercase tracking-[0.14em]">{tag}</div>
          <div className="mt-1.5 flex items-end justify-between gap-3">
            <h3 className="font-display font-semibold text-[20px] sm:text-[22px] display-tight text-ink">{label}</h3>
            <span className="shrink-0 inline-flex items-center gap-1 text-[13px] font-semibold text-ink/80 group-hover:text-amber transition-colors">
              Visit
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream-2"
        aria-label={`Open ${label} — ${host} (opens in a new tab)`}
      />
    </article>
  );
};

const Portfolio = () => (
  <section className="py-24 lg:py-28 bg-cream-2 border-y border-rule">
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
      <div className="max-w-[720px] mx-auto text-center">
        <div className="eyebrow uppercase text-[13px] font-semibold text-amber tracking-[0.12em] mb-5">A sampling of work</div>
        <h2 className="font-display font-semibold text-[40px] sm:text-[48px] lg:text-[56px] display-tight balance">
          This could be yours by Thursday.
        </h2>
        <p className="mt-5 text-[19px] text-ink/70 max-w-[600px] mx-auto pretty">
          Every site below was designed and built by Foxes.ai. Click any card to open the live site.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-8 lg:gap-10">
        {PORTFOLIO_SITES.map((site, i) => (
          <div
            key={site.url}
            className={i < 3 ? "xl:col-span-2" : "xl:col-span-3"}
          >
            <PortfolioPreviewCard {...site} />
          </div>
        ))}
      </div>

      <div className="mt-14 text-center">
        <a href="#book" className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-ink text-cream text-[15px] font-semibold hover:bg-amber transition-colors">
          See what mine would look like
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  </section>
);

// ————————————————————————————————————————————————————
// Comparison table
// ————————————————————————————————————————————————————
const Comparison = () => {
  const rows = [
    ["See the actual website before you pay",  true,  false, false],
    ["Built in under an hour",                   true,  false, false],
    ["No credit card to start",                  true,  false, true],
    ["Walk away with the code",                  true,  false, false],
    ["$99/mo all-in — or $0, your call",         true,  false, false],
    ["Booking, SEO, email, reviews included",    true,  false, false],
    ["Upfront cost",                             "$0",  "$6k–$15k", "$30/mo + setup"],
    ["Time to launch",                           "1 day", "4–8 weeks", "Weekends for weeks"],
  ];
  return (
    <section className="py-24 lg:py-28 bg-cream">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
        <div className="max-w-[720px] mb-12">
          <div className="eyebrow uppercase text-[13px] font-semibold text-amber tracking-[0.12em] mb-5">Pick wisely</div>
          <h2 className="font-display font-semibold text-[40px] sm:text-[48px] display-tight balance">
            Why owners stop shopping after our call.
          </h2>
        </div>

        <div className="rounded-2xl border border-rule bg-white overflow-hidden">
          <div className="grid grid-cols-4 bg-cream-2 border-b border-rule text-[12px] font-semibold uppercase tracking-[0.12em]">
            <div className="px-5 py-4 text-muted">Feature</div>
            <div className="px-5 py-4 text-ink bg-amber/10 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <span>Foxes.ai</span>
              <span className="shrink-0 px-2.5 py-1 rounded-full bg-amber text-white text-[10px] tracking-wider leading-none">RECOMMENDED</span>
            </div>
            <div className="px-5 py-4 text-muted">Agency</div>
            <div className="px-5 py-4 text-muted">DIY (Squarespace, etc)</div>
          </div>
          {rows.map(([label, a, b, c], i) => (
            <div key={i} className={`grid grid-cols-4 items-center text-[14px] ${i % 2 === 0 ? "bg-white" : "bg-cream/60"}`}>
              <div className="px-5 py-4 text-ink font-medium">{label}</div>
              <Cell v={a} highlight />
              <Cell v={b} />
              <Cell v={c} />
            </div>
          ))}
        </div>

        <p className="mt-5 text-[13px] text-muted">*Agency pricing based on average quoted cost for a 5‑page small business site with basic SEO, 2025.</p>
      </div>
    </section>
  );
};

const Cell = ({ v, highlight }) => {
  const base = `px-5 py-4 ${highlight ? "bg-amber/5" : ""}`;
  if (v === true)  return <div className={base}><Check className="w-5 h-5 text-forest" /></div>;
  if (v === false) return <div className={base}><X className="w-5 h-5 text-muted/50" /></div>;
  return <div className={`${base} text-ink font-medium tnum`}>{v}</div>;
};

// ————————————————————————————————————————————————————
// Offer
// ————————————————————————————————————————————————————
const Offer = () => (
  <section className="bg-white border-y border-rule py-24 lg:py-28">
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
      <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">
        <div className="lg:sticky lg:top-24">
          <div className="eyebrow uppercase text-[13px] font-semibold text-amber tracking-[0.12em] mb-5">The offer, plainly</div>
          <h2 className="font-display font-semibold text-[40px] sm:text-[48px] display-tight balance">
            Your website is free. Full stop.
          </h2>
          <p className="mt-6 text-[19px] leading-[1.6] text-ink/75 pretty max-w-[460px]">
            We design and build it before our call. On the call, you see it live. Then you pick one of two paths — both are good.
          </p>
          <div className="mt-10 flex items-center gap-4 text-[13px] text-muted">
            <span className="eyebrow uppercase tracking-[0.14em]">Zero upfront</span>
            <span className="w-1 h-1 rounded-full bg-rule" />
            <span className="eyebrow uppercase tracking-[0.14em]">Your choice on the call</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="bg-cream border border-rule rounded-2xl p-7 lg:p-8 flex flex-col">
            <div className="text-[12px] font-semibold text-muted uppercase tracking-[0.16em]">Path 1</div>
            <h3 className="mt-5 font-display font-semibold text-[24px] lg:text-[26px] display-tight">
              Take the code. Host it yourself.
            </h3>
            <p className="mt-4 text-[16px] leading-[1.6] text-ink/75 flex-1">
              We hand you a clean export + a deploy guide + a free 15‑min help call if you get stuck. The site is yours, free and clear. No catch, no weird license.
            </p>
            <div className="mt-8 pt-5 border-t border-rule">
              <div className="text-[14px] font-semibold text-forest">Cost: $0, forever</div>
            </div>
          </div>

          <div className="bg-forest text-cream rounded-2xl p-7 lg:p-8 flex flex-col relative overflow-hidden">
            <div aria-hidden className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-amber/10 blur-2xl" />
            <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-cream/70 relative">
              Path 2 — <span className="text-amber">What 8 of 10 choose</span>
            </div>
            <h3 className="mt-5 font-display font-semibold text-[24px] lg:text-[26px] display-tight relative">
              We host it. Everything included.
            </h3>
            <p className="mt-4 text-[16px] leading-[1.6] text-cream/80 flex-1 relative">
              Hosting, SSL, your .com domain, branded business email, booking widget, review automation, Google Maps, SEO, analytics, security, and lead inbox.
            </p>
            <div className="mt-8 pt-5 border-t border-cream/15 relative">
              <div className="font-semibold text-[18px] text-amber">$99/mo all‑in. No labor fees. Ever.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ————————————————————————————————————————————————————
// FAQ
// ————————————————————————————————————————————————————
const FAQ = () => {
  const [open, setOpen] = useState(0);
  const items = [
    { q: "Is it really free?", a: "Yes. The design and build of your website costs you nothing. If you want us to host it, run your domain, email, booking, and everything else, it's $99–$199/month. If not, we hand you the code. Your choice, on the call." },
    { q: "What's the catch?", a: "There isn't one. We can build sites fast, and our bet is that once you see yours, you'll want us to keep running it. But if you don't — we'll hand over the code and wish you luck." },
    { q: "How do you build it before we even talk?", a: "We use your Google Business Profile, existing site (if any), and the two answers you gave us in the form. Our designers plus modern AI tools compress what used to take two weeks into under an hour." },
    { q: "What's included in the $99/mo?", a: "Hosting, SSL, your .com domain, branded business email, booking widget, review request automation, Google Reviews display, Google Maps integration, mobile optimization, on‑page SEO, analytics dashboard, security monitoring, daily backups, and a lead inbox. Zero labor fees. Ever." },
    { q: "When does the $199/mo apply?", a: "If your business needs bookings, light e‑commerce, or multi‑location support. We'll tell you on the call — no surprises, no upsells buried later." },
    { q: "Who's Patrizio?", a: "Founder of Foxes.ai. Previously founded 5th Factory, acquired by JBowman Creative in Nashville. Has built websites for WH Properties, Parasol Management, The Cauble Group, Napule, Living Waters Yoga, HV Urban, and Kevin Sully TV." },
    { q: "What if I hate the design?", a: "You walk. You keep the code anyway. We'll even give you a free 15‑minute help call to deploy it on your own host. That's the whole guarantee — no clawback, no drama." },
  ];
  return (
    <section className="bg-cream-2 py-24 lg:py-28">
      <div className="max-w-[880px] mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <div className="eyebrow uppercase text-[13px] font-semibold text-amber tracking-[0.12em] mb-5">Frequently asked</div>
          <h2 className="font-display font-semibold text-[40px] sm:text-[48px] display-tight balance">
            Questions you should ask us.
          </h2>
        </div>

        <div className="border-t border-rule">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className={`border-b border-rule ${isOpen ? "open" : ""}`}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-6 py-6 lg:py-7 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-display font-semibold text-[20px] lg:text-[22px] display-tight pr-4">
                    {it.q}
                  </span>
                  <span
                    className={`shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition-colors duration-200 ${
                      isOpen ? "border-amber bg-amber" : "border-rule bg-white"
                    }`}
                    aria-hidden="true"
                  >
                    <Plus
                      className={`w-4 h-4 shrink-0 block transition-transform duration-300 ease-out ${
                        isOpen ? "rotate-45 text-white" : "rotate-0 text-ink"
                      }`}
                    />
                  </span>
                </button>
                <div className={`acc-body ${isOpen ? "open" : ""}`}>
                  <div>
                    <p className="pb-7 pr-16 text-[17px] leading-[1.65] text-ink/75 pretty">{it.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-white border border-rule flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="font-display font-semibold text-[22px]">Still have questions?</div>
            <div className="text-[15px] text-muted mt-1">Text Patrizio directly. Real phone. Real human.</div>
          </div>
          <a href="sms:+16155550142" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-ink text-cream text-[14px] font-semibold hover:bg-amber transition-colors">
            Text (615) 555‑0142
          </a>
        </div>
      </div>
    </section>
  );
};

// ————————————————————————————————————————————————————
// Final CTA — with embedded mini Calendly shortcut
// ————————————————————————————————————————————————————
const FinalCTA = () => {
  const scrollTop = () => document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <section className="bg-forest text-cream relative overflow-hidden">
      <div aria-hidden className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-amber/10 blur-3xl" />
      <div aria-hidden className="absolute -bottom-40 -left-40 w-[480px] h-[480px] rounded-full bg-amber/5 blur-3xl" />
      <div className="relative max-w-[1000px] mx-auto px-6 lg:px-10 py-24 lg:py-32 text-center">
        <div className="eyebrow uppercase text-[13px] font-semibold text-amber tracking-[0.18em] mb-6">One last thing</div>
        <h2 className="font-display font-semibold text-[44px] sm:text-[56px] lg:text-[64px] display-tight balance max-w-[820px] mx-auto">
          Your website is 20 minutes away.
        </h2>
        <p className="mt-6 text-[20px] sm:text-[22px] text-cream/75 max-w-[620px] mx-auto pretty">
          Book now. By the time we meet, your site is already built. You decide what happens next.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={scrollTop}
            className="group inline-flex items-center gap-2.5 h-16 px-10 rounded-full bg-amber text-white font-semibold text-[18px] hover:bg-[#B4471A] transition-colors"
          >
            Get my free website
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          </button>
          <a href="sms:+16155550142" className="inline-flex items-center gap-2 h-16 px-8 rounded-full border border-cream/25 text-cream text-[16px] font-medium hover:bg-cream/5 transition-colors">
            Or text us first
          </a>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[13px] text-cream/55 eyebrow uppercase tracking-[0.14em]">
          <span className="inline-flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> No credit card</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 20‑min call</span>
          <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Walk with the code</span>
        </div>
      </div>
    </section>
  );
};

// ————————————————————————————————————————————————————
// Footer
// ————————————————————————————————————————————————————
const Footer = () => (
  <footer className="border-t border-rule bg-cream">
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-[14px] text-muted">
        <span>🦊</span>
        <span className="font-display font-semibold text-ink">Foxes<span className="text-amber">.</span>ai</span>
        <span className="ml-2">© 2026</span>
      </div>
      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-6 gap-y-2 text-[14px] text-muted">
        <a href="/diy.html" className="hover:text-ink link-u">DIY setup guide</a>
        <a href="#" className="hover:text-ink link-u">Privacy</a>
        <a href="#" className="hover:text-ink link-u">Terms</a>
      </div>
    </div>
  </footer>
);

// ————————————————————————————————————————————————————
// Mobile sticky CTA
// ————————————————————————————————————————————————————
const MobileCTA = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const scrollTo = () => document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <div className={`lg:hidden fixed inset-x-4 bottom-4 z-50 transition-all duration-300 ${show ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"}`}>
      <button
        onClick={scrollTo}
        className="w-full h-14 rounded-full bg-amber text-white font-semibold text-[16px] inline-flex items-center justify-center gap-2 shadow-2xl"
      >
        Book my free website
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// ————————————————————————————————————————————————————
// App
// ————————————————————————————————————————————————————
const App = () => (
  <div className="min-h-screen bg-cream text-ink">
    <ScrollProgress />
    <AnnouncementBar />
    <Header />
    <Hero />
    <TrustBar />
    <Testimonials />
    <Portfolio />
    <Comparison />
    <Offer />
    <FAQ />
    <FinalCTA />
    <Footer />
    <MobileCTA />
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
