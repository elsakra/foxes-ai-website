import { useState, useEffect, useRef, useMemo } from "react";
import { useEmbedLivePortfolioPreviews } from "./hooks/useEmbedLivePortfolioPreviews.js";

const LANDER_META_PIXEL_DEFAULT = "952579584035948";
const META_PIXEL_ID =
  (import.meta.env.VITE_LANDER_META_PIXEL_ID?.trim() || LANDER_META_PIXEL_DEFAULT);

function getMetaPixelTestEventCode() {
  const env = import.meta.env.VITE_META_PIXEL_TEST_EVENT_CODE?.trim();
  if (env) return env;
  if (typeof window === "undefined") return "";
  try {
    return new URLSearchParams(window.location.search).get("test_event_code")?.trim() ?? "";
  } catch {
    return "";
  }
}

function MetaPixelLoader() {
  useEffect(() => {
    if (!META_PIXEL_ID || typeof document === "undefined") return;
    /* lander.html may have already inited the pixel (see inline script id there). */
    if (document.getElementById(`fb-pixel-lander-${META_PIXEL_ID}`)) return;
    if (typeof window.fbq === "function") return;
    const s = document.createElement("script");
    s.id = `fb-pixel-lander-${META_PIXEL_ID}`;
    const id = JSON.stringify(META_PIXEL_ID);
    const testCode = getMetaPixelTestEventCode();
    const testSnippet = testCode
      ? `fbq('set','test_event_code',${JSON.stringify(testCode)});`
      : "";
    s.textContent = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
${testSnippet}fbq('init', ${id});
fbq('track', 'PageView');`;
    document.head.appendChild(s);
  }, []);
  return null;
}

/** Dedupe in case Calendly emits more than once per session. */
let landerScheduleTracked = false;

function useLanderCalendlyScheduleMeta() {
  useEffect(() => {
    const onMsg = (e) => {
      if (e.origin !== "https://calendly.com") return;
      if (e.data?.event !== "calendly.event_scheduled") return;
      if (landerScheduleTracked) return;
      landerScheduleTracked = true;
      queueMicrotask(() => {
        if (typeof window.fbq === "function") window.fbq("track", "Schedule");
      });
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);
}

const PATRIZIO_PHOTO = "patrizio-20bio.avif";

const LIVE_PREVIEW_W = 1280;
const LIVE_PREVIEW_H = 820;

const useLivePreviewCover = (fallback = 0.38) => {
  const ref = useRef(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setBox({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);
  const { w, h } = box;
  const scale = w > 0 && h > 0 ? Math.max(w / LIVE_PREVIEW_W, h / LIVE_PREVIEW_H) : fallback;
  return [ref, scale];
};

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
const AnnouncementBar = () => (
  <div className="bg-forest text-cream">
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 min-h-10 py-2 flex items-center justify-center gap-3 text-[13px] text-center">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-amber opacity-75 animate-ping" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber" />
      </span>
      <span className="text-cream/90 leading-snug max-w-[920px]">
        <span className="font-medium text-cream">We build your site before the call</span>
        <span className="text-cream/60"> · </span>
        <span className="font-semibold text-amber">No credit card</span>
        <span className="text-cream/60"> · </span>
        <span>Keep the code free or host with us — monthly rate quoted on your call</span>
      </span>
    </div>
  </div>
);

// ————————————————————————————————————————————————————
// Scroll progress bar
// ————————————————————————————————————————————————————
const ScrollProgress = () => {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? window.scrollY / max : 0);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
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
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-3">
      <a href="/" className="flex items-center gap-2 group min-w-0">
        <span className="text-xl leading-none">🦊</span>
        <span className="font-display font-semibold text-[20px] tracking-tight truncate">Foxes<span className="text-amber">.</span>ai</span>
      </a>
      <a
        href="#book"
        className="sm:hidden shrink-0 inline-flex items-center gap-1 h-9 px-3.5 rounded-full bg-ink text-cream text-[12px] font-semibold hover:bg-amber transition-colors"
      >
        Book free call
        <ArrowRight className="w-3 h-3" />
      </a>
      <div className="hidden sm:flex items-center gap-5">
        <a href="/" className="text-[14px] font-medium text-muted hover:text-ink transition-colors link-u">Home</a>
        <a href="mailto:patrizio@foxes.ai" className="text-[14px] font-medium text-muted hover:text-ink transition-colors link-u">
          Email
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

/** Forward ad/analytics params into Calendly for attribution inside their dashboard. */
const CALENDLY_URL_TRACKING_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"];

function buildCalendlyBookingUrl() {
  try {
    const url = new URL(CALENDLY_URL);
    if (typeof window === "undefined") return url.toString();
    const inbound = new URLSearchParams(window.location.search);
    for (const key of CALENDLY_URL_TRACKING_KEYS) {
      const v = inbound.get(key);
      if (v) url.searchParams.set(key, v);
    }
    return url.toString();
  } catch {
    return CALENDLY_URL;
  }
}

/** Public DIY hosting guide (absolute URL for clarity in copy + emails). */
const DIY_GUIDE_URL = "https://www.foxes.ai/diy.html";

/** Slim hero trust row (matches TrustBar clients + testimonial tone). */
const HERO_TRUST_CLIENTS = ["Pool Bidder", "Margaritas.ai", "Animated Medical", "SC Law Center"];
const HERO_TRUST_QUOTE = {
  short: "Clear story, fast pages, and none of the usual agency runaround.",
  name: "Pool Bidder",
};

const CALENDLY_WIDGET_SRC = "https://assets.calendly.com/assets/external/widget.js";

function loadCalendlyScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    if (window.Calendly) return resolve();

    const existing = document.querySelector(`script[src="${CALENDLY_WIDGET_SRC}"]`);
    if (existing) {
      if (window.Calendly) return resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Calendly script failed")), { once: true });
      queueMicrotask(() => {
        if (window.Calendly) resolve();
      });
      return;
    }
    const s = document.createElement("script");
    s.src = CALENDLY_WIDGET_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Calendly script failed"));
    document.head.appendChild(s);
  });
}

/** Calendly JS inline embed (postMessage events). Init deferred until #book nears viewport to protect LCP. */
const CalendlyInlineEmbed = () => {
  const hostRef = useRef(null);
  const calendlyUrl = useMemo(() => buildCalendlyBookingUrl(), []);

  useEffect(() => {
    const mountEl = hostRef.current;
    if (!mountEl) return;
    let cancelled = false;
    const book = typeof document !== "undefined" ? document.getElementById("book") : null;
    const target = book ?? mountEl;

    const runInit = async () => {
      if (cancelled || mountEl.dataset.calendlyMounted === "1") return;
      mountEl.dataset.calendlyMounted = "1";
      try {
        await loadCalendlyScript();
        if (cancelled || hostRef.current !== mountEl || !window.Calendly) return;
        mountEl.innerHTML = "";
        window.Calendly.initInlineWidget({
          url: calendlyUrl,
          parentElement: mountEl,
          resize: true,
        });
      } catch {
        delete mountEl.dataset.calendlyMounted;
      }
    };

    const kick = () => {
      const ric = window.requestIdleCallback ?? ((fn) => window.setTimeout(fn, 800));
      ric(
        () => {
          void runInit();
        },
        { timeout: 3200 }
      );
    };

    let fallbackTimer = null;
    let io;

    const reveal = () => {
      io?.disconnect();
      if (fallbackTimer != null) window.clearTimeout(fallbackTimer);
      kick();
    };

    io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) reveal();
      },
      { root: null, rootMargin: "280px", threshold: 0 }
    );
    io.observe(target);
    fallbackTimer = window.setTimeout(reveal, 5500);

    return () => {
      cancelled = true;
      io?.disconnect();
      if (fallbackTimer != null) window.clearTimeout(fallbackTimer);
      mountEl.innerHTML = "";
      delete mountEl.dataset.calendlyMounted;
    };
  }, [calendlyUrl]);

  return (
    <div
      ref={hostRef}
      className="rounded-xl overflow-hidden border border-rule bg-white w-full calendly-inline-embed-host"
      style={{ minWidth: 320, minHeight: 680 }}
    />
  );
};

// ————————————————————————————————————————————————————
// Booking card (now with Calendly, framed with trust elements)
// ————————————————————————————————————————————————————
const BookingCard = () => (
  <div id="book" className="bg-white border border-rule rounded-2xl card-shadow-lg overflow-hidden">
    {/* header — tighter on lg so more viewport goes to Calendly */}
    <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-5 lg:px-6 lg:pt-5 lg:pb-3 bg-cream border-b border-rule">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-[11px] lg:text-[12px] font-semibold text-forest uppercase tracking-[0.14em]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-forest opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-forest" />
          </span>
          Live availability
        </div>
        <div className="text-[11px] lg:text-[12px] text-muted">
          <span className="text-ink font-medium tnum">20 min</span> · Zoom
        </div>
      </div>
      <h3 className="mt-2 sm:mt-3 lg:mt-2 font-display font-semibold text-[22px] sm:text-[24px] lg:text-[22px] display-tight leading-snug">
        Book your call — see your site on Zoom.
      </h3>
      <ul className="mt-3 sm:mt-4 lg:mt-2.5 space-y-1 lg:space-y-0.5 text-[13px] sm:text-[14px] text-ink/75">
        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-forest shrink-0" /> We design it <em className="italic">before</em> we meet</li>
        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-forest shrink-0" /> No credit card, no pressure, no catch</li>
        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-forest shrink-0" /> Walk away with the code <span className="text-ink/80">and</span> the full DIY guide if you pass</li>
      </ul>
    </div>
    {/* calendly */}
    <div className="p-3 sm:p-4 lg:p-3">
      <CalendlyInlineEmbed />
    </div>
    {/* footer trust */}
    <div className="px-5 sm:px-7 lg:px-6 py-3 sm:py-4 lg:py-2.5 bg-cream border-t border-rule flex items-center justify-between gap-4 text-[11px] sm:text-[12px] text-muted">
      <div className="inline-flex items-center gap-1.5 min-w-0">
        <Shield className="w-4 h-4 text-forest shrink-0" />
        <span className="truncate sm:whitespace-normal">100% free — nothing to cancel</span>
      </div>
      <div className="inline-flex items-center gap-1.5 shrink-0">
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
// Hero trust (client names + quote — visible without scrolling past hero)
// ————————————————————————————————————————————————————
const HeroBookingTrust = () => (
  <div className="mt-4 lg:mt-5 px-0.5">
    <figure className="text-center max-w-[440px] mx-auto">
      <blockquote className="text-[13px] sm:text-[14px] leading-snug text-ink/70 italic font-display">
        &ldquo;{HERO_TRUST_QUOTE.short}&rdquo;
      </blockquote>
      <figcaption className="mt-2 text-[12px] font-semibold text-ink/80 not-italic">— {HERO_TRUST_QUOTE.name}</figcaption>
    </figure>
    <p className="mt-3 text-[10px] sm:text-[11px] text-center text-muted uppercase tracking-[0.14em] font-medium leading-relaxed">
      {HERO_TRUST_CLIENTS.join(" · ")}
    </p>
  </div>
);

// ————————————————————————————————————————————————————
// Hero
// ————————————————————————————————————————————————————
const Hero = () => (
  <section id="top" className="relative grain">
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-6 sm:pt-12 lg:pt-12 pb-20 lg:pb-20">
      <div className="grid lg:grid-cols-[1.05fr_1fr] gap-6 sm:gap-10 lg:gap-10 xl:gap-14 items-start">
        <div className="order-2 lg:order-1">
          <div className="hidden lg:block mb-6">
            <LiveActivity />
          </div>

          <h1 className="font-display font-semibold text-[44px] sm:text-[56px] lg:text-[68px] xl:text-[76px] display-tight balance text-ink">
            We'll design your new website <em className="italic font-normal text-amber">before</em> our first call.
          </h1>

          <p className="mt-6 sm:mt-7 text-[18px] sm:text-[20px] lg:text-[21px] leading-[1.55] text-ink/75 pretty max-w-[600px]">
            Book a 20-minute Zoom. Your site is already built — you&apos;ll review it live on the call.{" "}
            <span className="text-ink font-medium">You pay nothing to have it.</span> Walk away anytime; if you skip hosting, you still get the code and our{" "}
            <a href={DIY_GUIDE_URL} className="font-medium text-forest link-u">DIY setup guide</a>.
          </p>

          <div className="mt-7 sm:mt-8 max-w-[600px] scroll-mt-28">
            <a
              id="hero-book-link"
              href="#book"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[56px] px-8 rounded-full bg-amber text-white text-[16px] font-semibold hover:bg-[#B4471A] transition-colors shadow-lg shadow-amber/20"
            >
              Book free call
              <ArrowRight className="w-4 h-4 shrink-0" />
            </a>
            <p className="mt-3 text-[12px] sm:text-[13px] font-medium text-muted text-center sm:text-left tracking-wide">
              No credit card · 20 minutes · Site already built
            </p>
            <p className="mt-5 text-[13px] sm:text-[14px] text-muted leading-snug">
              <span className="line-through decoration-amber decoration-2 text-ink/45">Agencies: often five figures before you see a real build</span>
              <span className="text-ink/55"> · </span>
              <span className="text-ink/70">Have yours before you pay us anything.</span>
            </p>
          </div>

          {/* Portrait + signature — swap for founder video when ready */}
          <figure className="mt-10 rounded-2xl overflow-hidden border border-rule bg-white card-shadow">
            <div className="relative w-full max-w-[400px] aspect-[3/4] mx-auto bg-cream-2">
              <img
                src={PATRIZIO_PHOTO}
                alt="Patrizio Murdocca, founder of Foxes.ai"
                width={800}
                height={1067}
                className="absolute inset-0 w-full h-full object-cover object-top"
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className="px-6 sm:px-8 py-6 sm:py-7 bg-cream border-t border-rule text-center">
              <p className="text-[15px] sm:text-[16px] leading-relaxed text-ink/75 italic font-display max-w-[360px] mx-auto">
                "I'm Patrizio. I've built 250+ sites. Let me show you what yours could look like."
              </p>
              <p className="mt-5 font-display text-[clamp(1.5rem,4vw,1.85rem)] text-ink italic font-medium tracking-tight">
                Patrizio Murdocca
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted font-semibold">Founder, Foxes.ai</p>
            </figcaption>
          </figure>

          <div className="mt-12 grid grid-cols-2 divide-x divide-rule border-y border-rule py-8">
            <Stat big="250+" label="sites delivered" />
            <Stat big="Free" label="to have yours" />
          </div>

          <ul className="mt-10 space-y-3.5 lg:space-y-3">
            {[
              <>Your site is <em className="italic">designed, built, and live-previewed</em> before we talk</>,
              <>Love it? <span className="font-semibold">Simple monthly hosting</span> — quoted on the call. Hosting, domain, branded email (up to 3 inboxes), booking, SEO, everything.</>,
              <>
                Don't love it? You still leave set up for success: we hand you the <span className="font-semibold text-ink">full code</span>{" "}
                <span className="text-ink/80">and</span> a complete guide to hosting it yourself — DNS, deploy, go-live — not an empty &quot;good luck&quot; send-off. No cost, no contract, no weirdness.{" "}
                <a href={DIY_GUIDE_URL} className="font-semibold text-forest link-u whitespace-nowrap">
                  Read the DIY guide →
                </a>
              </>,
              <>20 minutes on Zoom. No slide decks. No "discovery". Just your site.</>,
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-3 text-[17px] lg:text-[15px] text-ink/85 lg:text-ink/75">
                <AmberCheck />
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex items-start gap-4 p-5 lg:p-4 rounded-xl bg-forest/5 border border-forest/15">
            <Shield className="w-6 h-6 text-forest shrink-0 mt-0.5" />
            <div>
              <div className="font-display font-semibold text-[18px] lg:text-[16px] text-ink">Our "Walk Away" guarantee</div>
              <div className="mt-1 text-[14px] lg:text-[13px] text-ink/70">
                If you hate the design, walk — you still keep the code,{" "}
                <span className="text-ink/80">plus</span> our full DIY hosting guide so you&apos;re not on your own.{" "}
                <a href={DIY_GUIDE_URL} className="font-medium text-forest link-u">
                  See the guide
                </a>
                . No clawback, no drama.
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2 lg:sticky lg:top-[7.25rem]">
          <div className="lg:hidden space-y-3 mb-1">
            <LiveActivity />
            <p className="font-display font-semibold text-[24px] sm:text-[30px] display-tight balance text-ink leading-[1.12]">
              We&apos;ll design your new website <em className="italic font-normal text-amber">before</em> our first call.
            </p>
            <p className="text-[12px] sm:text-[13px] font-medium text-muted tracking-wide">
              No credit card · 20 min · Site ready before you meet Patrizio
            </p>
          </div>
          <BookingCard />
          <div className="mt-3 lg:mt-2 flex items-center justify-center gap-2 text-[12px] text-muted text-center">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Live times below — <span className="text-ink font-medium">updates in real time</span></span>
          </div>
          <HeroBookingTrust />
        </div>
      </div>
    </div>
  </section>
);

const Stat = ({ big, label }) => (
  <div className="px-4 sm:px-8 first:pl-0 last:pr-0 text-center first:text-left last:text-right">
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
  const clients = ["Pool Bidder", "Margaritas.ai", "Animated Medical", "SC Law Center"];
  return (
    <section className="bg-cream-2 border-y border-rule">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10 lg:py-12">
        <p className="text-center text-[12px] font-medium text-muted uppercase tracking-[0.18em] mb-7">
          Trusted by 250+ local businesses — from Nashville to Denver
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
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

const CLIENT_TESTIMONIALS = [
  {
    tone: "dark",
    quote:
      "We finally have a site that matches the product — clear story, fast pages, and none of the usual agency runaround. It was live while we were still juggling everything else.",
    name: "Pool Bidder",
    role: "poolbidder.com",
    result: "Live same week",
  },
  {
    quote:
      "The design feels premium and the process was straightforward. We reviewed a real build instead of endless mockups, which kept us moving.",
    name: "Margaritas.ai",
    role: "margaritas.ai",
    result: "Full refresh",
  },
  {
    quote:
      "Patients tell us the site finally matches how we show up in person — clear services, easy booking, and none of the clutter we had before.",
    name: "Animated Medical",
    role: "animatedmedical.com",
    result: "Clearer intake",
  },
];

const Testimonials = () => (
  <section className="py-24 lg:py-28 bg-cream">
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
      <div className="max-w-[720px] mb-14">
        <div className="eyebrow uppercase text-[13px] font-semibold text-amber tracking-[0.12em] mb-5">Client voices</div>
        <h2 className="font-display font-semibold text-[40px] sm:text-[48px] display-tight balance">
          What leaders say after we ship.
        </h2>
        <p className="mt-4 text-[17px] text-ink/70 pretty">
          Summarized from recent feedback after we shipped sites for these teams (portfolio below).
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CLIENT_TESTIMONIALS.map((t) => (
          <Testimonial key={t.role} {...t} />
        ))}
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
  { url: "https://animatedmedical.com", label: "Animated Medical", tag: "Healthcare" },
  { url: "https://sclawcenter.com", label: "SC Law Center", tag: "Legal" },
];

const PortfolioPreviewCard = ({ url, label, tag }) => {
  const [clipRef, scale] = useLivePreviewCover(0.38);
  const allowIframes = useEmbedLivePortfolioPreviews();
  const [iframeOn, setIframeOn] = useState(false);
  const href = url.replace(/\/$/, "");
  let host = "";
  try {
    host = new URL(href).hostname.replace(/^www\./, "");
  } catch {
    host = href;
  }

  useEffect(() => {
    const el = clipRef.current;
    if (!el || !allowIframes) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setIframeOn(true);
          io.disconnect();
        }
      },
      { root: null, rootMargin: "160px", threshold: 0.04 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [allowIframes, href]);

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
              <span className="text-muted shrink-0 text-[11px] leading-none" aria-hidden="true">🔒</span>
              <span className="text-[11px] sm:text-[12px] font-mono text-ink/65 truncate tabular-nums">{host}</span>
            </div>
          </div>
          <span className="w-8 shrink-0" aria-hidden="true" />
        </div>

        <div ref={clipRef} className="relative h-[220px] sm:h-[260px] lg:h-[240px] overflow-hidden bg-[#ECEAE6]">
          {allowIframes ? (
            iframeOn ? (
              <div
                className="absolute left-1/2 top-0 w-[1280px] min-w-[1280px] origin-top"
                style={{ height: LIVE_PREVIEW_H, transform: `translateX(-50%) scale(${scale})` }}
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
            ) : (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-cream-2 to-[#D8D4CC] px-4 text-center"
                aria-hidden="true"
              >
                <span className="text-[11px] font-mono text-ink/50 max-w-full truncate px-1" title={host}>
                  {host}
                </span>
                <p className="mt-2 max-w-[220px] text-[12px] text-ink/50 leading-snug">Preview loads as you scroll</p>
              </div>
            )
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-cream-2 to-[#D8D4CC] p-4 text-center">
              <span className="text-[11px] font-mono text-ink/50 max-w-full truncate px-1" title={host}>
                {host}
              </span>
              <p className="mt-2 text-[13px] text-ink/55 leading-snug">Live preview on desktop — tap the card to open the site</p>
            </div>
          )}
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
        {PORTFOLIO_SITES.map((site) => (
          <div key={site.url} className="xl:col-span-3">
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
    ["Have the actual website before you pay",  true,  false, false],
    ["Built before your call",                   true,  false, false],
    ["No credit card to start",                  true,  false, true],
    ["Walk away with the code",                  true,  false, false],
    ["All-in monthly hosting — or take the code", true,  false, false],
    ["Booking, SEO, email, reviews included",    true,  false, false],
    ["Upfront cost",                             "None", "Often thousands", "Plans + setup"],
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

        <p className="mt-5 text-[13px] text-muted">*Typical agency engagements involve deposits and substantial totals before a live build. DIY platforms often advertise low monthly fees with add‑ons extra.</p>
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
              Take the code — we arm you to self‑host.
            </h3>
            <p className="mt-4 text-[16px] leading-[1.6] text-ink/75 flex-1">
              You get a clean export <span className="text-ink/80">and</span> a thorough, step-by-step DIY guide (hosting, DNS, SSL, going live) so self-hosting feels doable — not a cold handoff. The site is yours, free and clear.{" "}
              <a href={DIY_GUIDE_URL} className="font-semibold text-forest link-u">
                Open the setup guide →
              </a>
            </p>
            <div className="mt-8 pt-5 border-t border-rule">
              <div className="text-[14px] font-semibold text-forest">Cost: Nothing — the build is yours</div>
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
              Hosting, SSL, your .com domain, branded business email (up to 3 inboxes; more at provider cost), booking widget, review automation, Google Maps, SEO, analytics, security, and lead inbox.
            </p>
            <div className="mt-8 pt-5 border-t border-cream/15 relative">
              <div className="font-semibold text-[18px] text-amber">Monthly rate quoted on the call — all‑in for what you need. No labor fees. Ever.</div>
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
    {
      q: "Is it really free?",
      a: (
        <>
          Yes. The design and build of your website costs you nothing. If you want us to host it — your domain, branded email (up to 3 inboxes included; additional inboxes at provider cost), booking, and the rest — Patrizio quotes a straightforward monthly on the call based on what you need. If not, we hand you the code{" "}
          <span className="text-ink/80">and</span> a full <a href={DIY_GUIDE_URL} className="font-semibold text-forest link-u">DIY setup guide</a> to host it yourself — still $0. Your choice.
        </>
      ),
    },
    {
      q: "What's the catch?",
      a: (
        <>
          There isn&apos;t one. We build sites fast, and our bet is you&apos;ll want us to keep running yours. If you&apos;d rather self-host, you still get the code{" "}
          <span className="text-ink/80">and</span> our complete <a href={DIY_GUIDE_URL} className="font-semibold text-forest link-u">DIY hosting guide</a> — so you&apos;re set up to succeed, not left on your own.
        </>
      ),
    },
    { q: "How do you build it before we even talk?", a: "We use your Google Business Profile, existing site (if any), and the short answers you give when you book. Our designers pair that with modern tools so you get a real, reviewable site before the call — not a weeks-long wireframe phase." },
    { q: "What's included if we host?", a: "Hosting, SSL, your .com domain, branded business email (up to 3 inboxes included; beyond that at provider cost), booking widget, review request automation, Google Reviews display, Google Maps integration, mobile optimization, on‑page SEO, analytics dashboard, security monitoring, and a lead inbox. Zero labor fees. Ever." },
    { q: "How is hosting priced?", a: "Patrizio quotes one monthly number on the call from what you actually need — heavier booking, e‑commerce, or multi‑location setups may land higher than a simple brochure site, and you'll know before you commit. No surprises, no upsells buried later." },
    { q: "Who's Patrizio?", a: "Founder of Foxes.ai. Previously founded 5th Factory, acquired by JBowman Creative in Nashville. Recent builds include Pool Bidder, Margaritas.ai, Animated Medical, SC Law Center, and more." },
    {
      q: "What if I hate the design?",
      a: (
        <>
          You walk, and you keep the code anyway — <span className="text-ink/80">plus</span> the same <a href={DIY_GUIDE_URL} className="font-semibold text-forest link-u">step-by-step DIY guide</a> we give everyone who self-hosts, so you&apos;re never stuck figuring out deploy alone. No clawback, no drama.
        </>
      ),
    },
  ];
  return (
    <section id="faq" className="scroll-mt-28 bg-cream-2 py-24 lg:py-28">
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
                    <div className="pb-7 pr-16 text-[17px] leading-[1.65] text-ink/75 pretty">{it.a}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-white border border-rule flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="font-display font-semibold text-[22px]">Still have questions?</div>
            <div className="text-[15px] text-muted mt-1">Email works best — we read everything.</div>
          </div>
          <a href="mailto:patrizio@foxes.ai" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-ink text-cream text-[14px] font-semibold hover:bg-amber transition-colors">
            patrizio@foxes.ai
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
          <a href="mailto:patrizio@foxes.ai" className="inline-flex items-center gap-2 h-16 px-8 rounded-full border border-cream/25 text-cream text-[16px] font-medium hover:bg-cream/5 transition-colors">
            Email us first
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
        <a href={DIY_GUIDE_URL} className="hover:text-ink link-u">DIY setup guide</a>
        <a href="#" className="hover:text-ink link-u">Privacy</a>
        <a href="#" className="hover:text-ink link-u">Terms</a>
      </div>
    </div>
  </footer>
);

// ————————————————————————————————————————————————————
// Mobile sticky CTA (only after hero primary CTA scrolls away; hidden while #book is visible)
// ————————————————————————————————————————————————————
const MOBILE_MAX = "(max-width: 1023px)";

const MobileCTA = () => {
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_MAX).matches
  );
  const [bookInView, setBookInView] = useState(false);
  const [heroLinkInView, setHeroLinkInView] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MAX);
    const onMq = () => setNarrow(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);
    return () => mq.removeEventListener("change", onMq);
  }, []);

  useEffect(() => {
    if (!narrow) return;
    const onScroll = () => setScrollY(window.scrollY || 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [narrow]);

  useEffect(() => {
    if (!narrow) return;
    const book = document.getElementById("book");
    const heroLink = document.getElementById("hero-book-link");
    if (!book || !heroLink) return;

    const ioBook = new IntersectionObserver(
      ([entry]) => setBookInView(entry.isIntersecting),
      { root: null, threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    const ioHero = new IntersectionObserver(
      ([entry]) => setHeroLinkInView(entry.isIntersecting),
      { root: null, threshold: 0.15, rootMargin: "-64px 0px 0px 0px" }
    );
    ioBook.observe(book);
    ioHero.observe(heroLink);
    return () => {
      ioBook.disconnect();
      ioHero.disconnect();
    };
  }, [narrow]);

  if (!narrow) return null;

  /** Avoid double-CTA on first paint: IO can briefly report the hero link as out of view before layout settles. */
  const show = scrollY > 32 && !bookInView && !heroLinkInView;
  const scrollTo = () => document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <div
      className={`fixed inset-x-4 bottom-4 z-50 transition-all duration-300 ${show ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"}`}
      aria-hidden={!show}
    >
      <button
        type="button"
        onClick={scrollTo}
        className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-amber text-[16px] font-semibold text-white shadow-2xl"
      >
        Book free call
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

// ————————————————————————————————————————————————————
// App
// ————————————————————————————————————————————————————
const App = () => {
  useLanderCalendlyScheduleMeta();
  return (
  <div className="min-h-screen bg-cream text-ink">
    <MetaPixelLoader />
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
};

export default App;
