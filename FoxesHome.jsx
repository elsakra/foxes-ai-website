const { useState, useEffect, useRef } = React;

/** Opens the lander booking card + Calendly embed (no separate /build route on static hosting). */
const BOOKING_URL = "/lander.html#book";
const LANDER_URL = "/lander.html";
const DIY_URL = "/diy.html";
const PATRIZIO_PHOTO = "patrizio-20bio.avif";

const PORTFOLIO_SITES = [
  { url: "https://poolbidder.com", label: "Pool Bidder", tag: "Marketplace" },
  { url: "https://margaritas.ai", label: "Margaritas.ai", tag: "Hospitality & AI" },
  { url: "https://may.construction", label: "May Construction", tag: "Construction" },
  { url: "https://animatedmedical.com", label: "Animated Medical", tag: "Healthcare" },
  { url: "https://sclawcenter.com", label: "SC Law Center", tag: "Legal" },
];

const LIVE_PREVIEW_W = 1280;
const LIVE_PREVIEW_H = 820;

/** Scale iframe to cover the clip (like object-fit: cover) — fills width and height, no side gutters. */
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

// ———————————————————————————————————————————————
// Icons (minimal, brand-consistent — no starter-pack look)
// ———————————————————————————————————————————————
const S = ({ d, className = "", stroke = 1.5, fill = "none" }) => (
  <svg viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{d}</svg>
);
const I = {
  Pencil: (p) => <S {...p} d={<><path d="M4 20h4L20 8l-4-4L4 16v4z"/><path d="M14 6l4 4"/></>} />,
  Server: (p) => <S {...p} d={<><rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01"/></>} />,
  Trend:  (p) => <S {...p} d={<><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></>} />,
  Shield: (p) => <S {...p} d={<><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></>} />,
  Globe:  (p) => <S {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18"/></>} />,
  Mail:   (p) => <S {...p} d={<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></>} />,
  Save:   (p) => <S {...p} d={<><path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h8V3M8 13h8v8H8z"/></>} />,
  Lock:   (p) => <S {...p} d={<><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></>} />,
  Map:    (p) => <S {...p} d={<><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v16M15 6v16"/></>} />,
  Cal:    (p) => <S {...p} d={<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>} />,
  Msg:    (p) => <S {...p} d={<><path d="M4 5h16v11H8l-4 4V5z"/></>} />,
  Star:   (p) => <svg viewBox="0 0 24 24" fill="currentColor" className={p.className} aria-hidden="true"><path d="M12 3l2.9 6.2 6.6.6-5 4.6 1.5 6.6L12 17.8 5.9 21l1.6-6.6-5-4.6 6.6-.6z"/></svg>,
  Pin:    (p) => <S {...p} d={<><path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></>} />,
  Search: (p) => <S {...p} d={<><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></>} />,
  Phone:  (p) => <S {...p} d={<><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M11 18h2"/></>} />,
  Bar:    (p) => <S {...p} d={<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>} />,
  Inbox:  (p) => <S {...p} d={<><path d="M3 13l2-8h14l2 8v6H3z"/><path d="M3 13h5l1 2h6l1-2h5"/></>} />,
  Life:   (p) => <S {...p} d={<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M5.5 5.5l4 4M14.5 14.5l4 4M18.5 5.5l-4 4M9.5 14.5l-4 4"/></>} />,
  ArrowR: (p) => <S {...p} d={<><path d="M5 12h14M13 6l6 6-6 6"/></>} />,
  ArrowD: (p) => <S {...p} d={<><path d="M12 5v14M6 13l6 6 6-6"/></>} />,
  Menu:   (p) => <S {...p} d={<><path d="M4 7h16M4 12h16M4 17h16"/></>} />,
  X:      (p) => <S {...p} d={<><path d="M6 6l12 12M18 6L6 18"/></>} />,
};

const Plus = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

// ———————————————————————————————————————————————
// Header with sticky blur after 80px
// ———————————————————————————————————————————————
const Header = () => {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${stuck ? "bg-cream/80 backdrop-blur-md border-b border-rule" : "bg-transparent border-b border-transparent"}`}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-16 lg:h-[72px] flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <span className="text-xl leading-none">🦊</span>
          <span className="font-display font-semibold text-[20px] tracking-tight">Foxes<span className="text-amber">.</span>ai</span>
        </a>
        <nav className="hidden lg:flex items-center gap-8">
          {[["Work","#work"],["About","#about"],["Pricing","#pricing"],["FAQ","#faq"],["Our pitch",LANDER_URL]].map(([l,h]) => (
            <a key={l} href={h} className="text-[15px] font-medium text-ink hover:text-amber transition-colors">{l}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href={BOOKING_URL} className="hidden sm:inline-flex items-center gap-1.5 h-11 px-6 rounded-full bg-amber text-white text-[15px] font-semibold hover:bg-[#B4471A] transition-colors">
            Get my free website
            <I.ArrowR className="w-4 h-4" />
          </a>
          <button onClick={() => setOpen(true)} className="lg:hidden w-10 h-10 rounded-full border border-rule bg-cream/70 flex items-center justify-center">
            <I.Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden fixed inset-0 bg-cream z-50 p-6">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <span className="text-xl">🦊</span>
              <span className="font-display font-semibold text-[20px]">Foxes<span className="text-amber">.</span>ai</span>
            </a>
            <button onClick={() => setOpen(false)} className="w-10 h-10 rounded-full border border-rule flex items-center justify-center"><I.X className="w-5 h-5"/></button>
          </div>
          <nav className="mt-10 flex flex-col gap-1">
            {[["Work","#work"],["About","#about"],["Pricing","#pricing"],["FAQ","#faq"],["Our pitch",LANDER_URL]].map(([l,h]) => (
              <a key={l} href={h} onClick={() => setOpen(false)} className="font-display font-semibold text-[36px] display-tight py-3">{l}</a>
            ))}
          </nav>
          <a href={BOOKING_URL} className="mt-10 inline-flex items-center gap-2 h-14 px-8 rounded-full bg-amber text-white font-semibold">
            Get my free website <I.ArrowR className="w-4 h-4"/>
          </a>
        </div>
      )}
    </header>
  );
};

// ———————————————————————————————————————————————
// Hero
// ———————————————————————————————————————————————
const Hero = () => {
  const featured = PORTFOLIO_SITES[0];
  const [pvClipRef, pvScale] = useLivePreviewCover(0.4);
  const href = featured.url.replace(/\/$/, "");
  let host = "";
  try {
    host = new URL(href).hostname.replace(/^www\./, "");
  } catch {
    host = href;
  }
  return (
    <section className="relative grain pt-40 lg:pt-[180px] pb-28 lg:pb-32">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="eyebrow uppercase text-[13px] font-semibold text-amber tracking-[0.18em] mb-8">
          Websites for local businesses
        </div>
        <h1 className="font-display font-semibold display-tight balance text-ink text-[52px] sm:text-[72px] lg:text-[92px] xl:text-[104px] max-w-[1050px]">
          Stunning websites. Built <span className="italic-fraunces text-amber">free</span>. Delivered before we even meet.
        </h1>
        <p className="mt-8 text-[20px] sm:text-[24px] leading-[1.5] text-ink/70 pretty max-w-[720px]">
          Then we keep them running — hosting, domain, email, booking, reviews, the whole stack — for $99/mo, all‑in. Or take the code and run it yourself. Your call.
        </p>
        <p className="mt-6 text-[12px] sm:text-[13px] font-semibold text-muted eyebrow uppercase tracking-[0.14em] max-w-[720px] leading-relaxed">
          No credit card. No sales call pressure. 20 minutes, then your site.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <a href={BOOKING_URL} className="group inline-flex items-center gap-2 h-12 px-7 rounded-full bg-amber text-white text-[15px] font-semibold hover:bg-[#B4471A] transition-colors">
            Get my free website
            <I.ArrowR className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a href="#work" className="inline-flex items-center gap-2 text-[16px] font-medium text-ink link-u">
            See our work <I.ArrowD className="w-4 h-4" />
          </a>
        </div>

        <figure className="mt-20 lg:mt-24">
          <div className="rounded-2xl overflow-hidden border border-rule card-shadow bg-white">
            <div className="h-10 bg-cream-2 border-b border-rule flex items-center gap-2 px-3 sm:px-4">
              <span className="flex gap-1.5 shrink-0" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8A09A]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E6C04A]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#61C454]" />
              </span>
              <div className="flex-1 min-w-0 flex justify-center">
                <div className="flex items-center gap-2 max-w-full rounded-md bg-white border border-rule/80 px-3 py-1 text-[11px] sm:text-[12px] font-mono text-ink/65 truncate tabular-nums">
                  <span className="text-muted shrink-0" aria-hidden="true">🔒</span>
                  {host}
                </div>
              </div>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-[12px] font-semibold text-amber hover:text-[#B4471A] transition-colors relative z-20"
              >
                Open site
              </a>
            </div>
            <div ref={pvClipRef} className="relative h-[240px] sm:h-[280px] lg:h-[300px] overflow-hidden bg-[#ECEAE6]">
              <div
                className="absolute left-1/2 top-0 w-[1280px] min-w-[1280px] origin-top"
                style={{ height: LIVE_PREVIEW_H, transform: `translateX(-50%) scale(${pvScale})` }}
              >
                <iframe
                  src={href}
                  title={`${featured.label} live preview`}
                  loading="eager"
                  referrerPolicy="no-referrer-when-downgrade"
                  tabIndex={-1}
                  className="w-full h-full border-0 bg-white pointer-events-none"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {PORTFOLIO_SITES.map((s) => (
              <a
                key={s.url}
                href={s.url.replace(/\/$/, "")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full border border-rule bg-white px-3.5 py-1.5 text-[13px] font-medium text-ink hover:border-amber hover:text-amber transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
          <figcaption className="mt-4 text-[15px] text-muted">
            <span className="italic">{featured.label}</span>
            {" "}— live site in the frame above. Five more below with full previews.
          </figcaption>
        </figure>
      </div>
    </section>
  );
};

// ———————————————————————————————————————————————
// What we do
// ———————————————————————————————————————————————
const Capabilities = () => {
  const items = [
    { Icon: I.Pencil, eyebrow: "Design", h: "We build it.",
      b: "A custom website, designed around your business — not a template with your logo slapped on. Ready before our first call, so you judge the work, not a pitch." },
    { Icon: I.Server, eyebrow: "Host", h: "We run it.",
      b: "Hosting, SSL, your .com domain, branded business email, security monitoring, daily backups. One monthly price, no labor fees, no surprise invoices." },
    { Icon: I.Trend,  eyebrow: "Grow", h: "We help it grow.",
      b: "Booking widget, review automation, Google Maps integration, on‑page SEO, lead inbox, analytics. The stack that turns a website into a working storefront." },
  ];
  return (
    <section className="bg-white py-24 lg:py-32 border-y border-rule">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-[820px] mx-auto">
          <div className="eyebrow uppercase text-[13px] font-semibold text-amber tracking-[0.18em] mb-6">What we do</div>
          <h2 className="font-display font-semibold text-[40px] sm:text-[52px] lg:text-[60px] display-tight balance">
            Everything your business needs online, in one place.
          </h2>
        </div>
        <div className="mt-20 grid md:grid-cols-3 gap-12 lg:gap-16">
          {items.map((it, i) => (
            <div key={i}>
              <it.Icon className="w-8 h-8 text-amber" />
              <div className="mt-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">{it.eyebrow}</div>
              <h3 className="mt-2 font-display font-semibold text-[28px] lg:text-[30px] display-tight">{it.h}</h3>
              <p className="mt-3 text-[17px] leading-[1.6] text-ink/75 pretty max-w-[380px]">{it.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ———————————————————————————————————————————————
// Founder note
// ———————————————————————————————————————————————
const Founder = () => (
  <section id="about" className="bg-cream-2 py-24 lg:py-32">
    <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
      <div className="grid lg:grid-cols-[2fr_3fr] gap-14 lg:gap-20 items-center">
        <figure>
          <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-rule relative bg-cream-2">
            <img
              src={PATRIZIO_PHOTO}
              alt="Patrizio Murdocca, founder of Foxes.ai"
              width={640}
              height={800}
              className="absolute inset-0 w-full h-full object-cover object-top"
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption className="mt-3 italic text-[14px] text-muted">Patrizio Murdocca, founder</figcaption>
        </figure>

        <div>
          <div className="eyebrow uppercase text-[13px] font-semibold text-amber tracking-[0.18em] mb-6">Why we do this</div>
          <h2 className="font-display font-semibold text-[36px] sm:text-[44px] lg:text-[48px] display-tight balance leading-[1.05]">
            Local businesses deserve websites that match the work they do.
          </h2>
          <p className="mt-8 text-[19px] leading-[1.6] text-ink/85 pretty max-w-[620px]">
            I spent years building 5th Factory into a design agency. When we sold to JBowman Creative, I thought I was done with agency work. But I kept seeing the same thing: local businesses — the best restaurants, the best yoga studios, the best tradespeople — stuck with websites that embarrassed them. They couldn't afford what I used to charge. So Foxes.ai was born: stunning websites, free. We make our money keeping them running. Not building them.
          </p>
          <p className="mt-5 text-[19px] leading-[1.6] text-ink/85 pretty max-w-[620px]">
            My promise: if we can't build you something you love, we'll be the first to say so. If we can, you'll see it before you pay us a dime.
          </p>
          <div className="mt-8 italic-fraunces text-[22px]">— Patrizio</div>
        </div>
      </div>
    </div>
  </section>
);

// ———————————————————————————————————————————————
// Work — five live portfolio sites (preview + link)
// ———————————————————————————————————————————————
const WorkPreviewCard = ({ url, label, tag }) => {
  const [clipRef, scale] = useLivePreviewCover(0.38);
  const href = url.replace(/\/$/, "");
  let host = "";
  try {
    host = new URL(href).hostname.replace(/^www\./, "");
  } catch {
    host = href;
  }
  return (
    <article className="group relative">
      <div className="rounded-2xl overflow-hidden border border-rule bg-cream card-shadow transition-all duration-300 group-hover:-translate-y-1 group-hover:card-shadow-lg">
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-rule bg-gradient-to-b from-white to-cream">
          <span className="flex gap-1.5 shrink-0" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E8A09A]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#E6C04A]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#61C454]" />
          </span>
          <div className="flex-1 min-w-0 flex justify-center">
            <div className="flex items-center gap-2 max-w-full rounded-lg bg-white border border-rule/80 px-3 py-1 shadow-[0_1px_0_rgba(10,10,10,0.04)]">
              <span className="text-muted shrink-0 text-[11px] leading-none" aria-hidden="true">🔒</span>
              <span className="text-[11px] sm:text-[12px] font-mono text-ink/65 truncate tabular-nums">{host}</span>
            </div>
          </div>
          <span className="w-8 shrink-0" aria-hidden="true" />
        </div>

        <div ref={clipRef} className="relative h-[220px] sm:h-[260px] lg:h-[240px] overflow-hidden bg-[#ECEAE6]">
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
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20" aria-hidden="true" />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-hidden="true"
          />
        </div>

        <div className="px-4 sm:px-5 py-4 border-t border-rule bg-white">
          <div className="text-[11px] font-semibold text-amber uppercase tracking-[0.14em]">{tag}</div>
          <div className="mt-1.5 flex items-end justify-between gap-3">
            <h3 className="font-display font-semibold text-[20px] sm:text-[22px] display-tight text-ink">{label}</h3>
            <span className="shrink-0 inline-flex items-center gap-1 text-[13px] font-semibold text-ink/80 group-hover:text-amber transition-colors">
              Visit
              <I.ArrowR className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        aria-label={`Open ${label} — ${host} (opens in a new tab)`}
      />
    </article>
  );
};

const Work = () => (
  <section id="work" className="bg-white py-24 lg:py-32 border-b border-rule">
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <div className="eyebrow uppercase text-[13px] font-semibold text-amber tracking-[0.18em] mb-5">Selected work</div>
          <h2 className="font-display font-semibold text-[44px] sm:text-[52px] lg:text-[60px] display-tight balance">
            Some of what we've built.
          </h2>
          <p className="mt-4 text-[17px] text-ink/70 max-w-[560px] pretty">
            Live previews below — click any card to open the full site in a new tab.
          </p>
        </div>
      </div>
      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-8 lg:gap-10">
        {PORTFOLIO_SITES.map((site, i) => (
          <div key={site.url} className={i < 3 ? "xl:col-span-2" : "xl:col-span-3"}>
            <WorkPreviewCard {...site} />
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ———————————————————————————————————————————————
// Pricing / included
// ———————————————————————————————————————————————
const Included = () => {
  const items = [
    [I.Shield, "Hosting + SSL"],
    [I.Globe,  ".com Domain"],
    [I.Mail,   "Business Email (3–5 addresses)"],
    [I.Save,   "Daily Backups"],
    [I.Lock,   "Security Monitoring"],
    [I.Map,    "Google Business Optimization"],
    [I.Cal,    "Booking Widget"],
    [I.Msg,    "Contact Forms + Auto‑reply"],
    [I.Star,   "Review Request Automation"],
    [I.Pin,    "Google Maps Embed"],
    [I.Search, "On‑Page SEO + Schema"],
    [I.Phone,  "Mobile Optimization"],
    [I.Bar,    "Analytics Dashboard"],
    [I.Inbox,  "Lead Inbox (CRM‑lite)"],
    [I.Life,   "Unlimited Support"],
  ];
  return (
    <section id="pricing" className="bg-cream py-24 lg:py-32">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-[820px] mx-auto">
          <div className="eyebrow uppercase text-[13px] font-semibold text-amber tracking-[0.18em] mb-6">What's included</div>
          <h2 className="font-display font-semibold text-[40px] sm:text-[52px] lg:text-[60px] display-tight balance">
            $99 a month. Everything. No labor fees, ever.
          </h2>
          <p className="mt-6 text-[20px] leading-[1.55] text-ink/70 max-w-[660px] mx-auto pretty">
            One price. One invoice. No "that's extra" ever. If you'd rather self‑host, take the code — it's free and it's yours.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 border-t border-l border-rule rounded-2xl overflow-hidden bg-white">
          {items.map(([Ic, label], i) => (
            <div key={i} className="border-r border-b border-rule p-6 lg:p-7 bg-white">
              <Ic className="w-5 h-5 text-amber" />
              <div className="mt-4 text-[15px] font-medium text-ink leading-snug">{label}</div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-[14px] text-muted max-w-[620px] mx-auto">
          Businesses with e‑commerce, multi‑location setups, or custom booking flows run $199/mo. We'll tell you on the call — no surprises.
        </p>
      </div>
    </section>
  );
};

// ———————————————————————————————————————————————
// How it works — forest band
// ———————————————————————————————————————————————
const HowItWorks = () => {
  const steps = [
    { n: "01", h: "Book the call",               b: "20 minutes on Zoom. Tell us about your business. No credit card." },
    { n: "02", h: "We build your site",          b: "Our team + AI tools design it before we hop on. Usually under an hour." },
    { n: "03", h: "See it live",                 b: "Patrizio screen‑shares the finished site. React honestly. Ask for changes." },
    { n: "04", h: "Launch or take the code",     b: "Love it? We host it for $99/mo. Don't? We hand you the code free." },
  ];
  return (
    <section className="bg-forest text-cream py-28 lg:py-36 relative overflow-hidden">
      <div aria-hidden className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-amber/10 blur-3xl" />
      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-[860px] mx-auto">
          <div className="eyebrow uppercase text-[13px] font-semibold text-amber tracking-[0.18em] mb-6">How it works</div>
          <h2 className="font-display font-semibold text-[40px] sm:text-[52px] lg:text-[60px] display-tight balance">
            From ad click to a live website in under a week.
          </h2>
        </div>

        <div className="mt-20 relative">
          {/* connector line on desktop */}
          <div className="hidden lg:block absolute top-[52px] left-[5%] right-[5%] dashed-amber opacity-60" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 relative">
            {steps.map((s, i) => (
              <div key={i} className="relative">
                <div className="font-display font-semibold text-amber text-[80px] lg:text-[96px] display-tight leading-none tnum">{s.n}</div>
                <h3 className="mt-4 font-display font-semibold text-[24px] lg:text-[26px] display-tight text-cream">{s.h}</h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-cream/70 pretty max-w-[260px]">{s.b}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
          <a href={BOOKING_URL} className="inline-flex items-center gap-2 h-14 px-8 rounded-full bg-amber text-white text-[16px] font-semibold hover:bg-[#B4471A] transition-colors">
            Book your call <I.ArrowR className="w-4 h-4"/>
          </a>
        </div>
      </div>
    </section>
  );
};

// ———————————————————————————————————————————————
// FAQ (same topics as lander — anchor #faq for nav)
// ———————————————————————————————————————————————
const FAQ = () => {
  const [open, setOpen] = useState(0);
  const items = [
    { q: "Is it really free?", a: "Yes. The design and build of your website costs you nothing. If you want us to host it, run your domain, email, booking, and everything else, it's $99–$199/month. If not, we hand you the code. Your choice, on the call." },
    { q: "What's the catch?", a: "There isn't one. We can build sites fast, and our bet is that once you see yours, you'll want us to keep running it. But if you don't — we'll hand over the code and wish you luck." },
    { q: "How do you build it before we even talk?", a: "We use your Google Business Profile, existing site (if any), and the two answers you gave us in the form. Our designers plus modern AI tools compress what used to take two weeks into under an hour." },
    { q: "What's included in the $99/mo?", a: "Hosting, SSL, your .com domain, branded business email, booking widget, review request automation, Google Reviews display, Google Maps integration, mobile optimization, on‑page SEO, analytics dashboard, security monitoring, daily backups, and a lead inbox. Zero labor fees. Ever." },
    { q: "When does the $199/mo apply?", a: "If your business needs bookings, light e‑commerce, or multi‑location support. We'll tell you on the call — no surprises, no upsells buried later." },
    { q: "Who's Patrizio?", a: "Founder of Foxes.ai. Previously founded 5th Factory, acquired by JBowman Creative in Nashville. Recent builds include Pool Bidder, Margaritas.ai, May Construction, Animated Medical, SC Law Center, and more." },
    { q: "What if I hate the design?", a: "You walk. You keep the code anyway. We don't include a free deploy hand-holding call for self‑hosting — that's the tradeoff for $0. No clawback, no drama." },
  ];
  return (
    <section id="faq" className="scroll-mt-28 bg-cream-2 py-24 lg:py-32 border-y border-rule">
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
                  type="button"
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
                    <p className="pb-7 pr-4 sm:pr-16 text-[17px] leading-[1.65] text-ink/75 pretty">{it.a}</p>
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

// ———————————————————————————————————————————————
// Testimonials (portfolio clients — keep in sync with FoxesLanding.jsx)
// ———————————————————————————————————————————————
const CLIENT_TESTIMONIALS = [
  {
    quote:
      "We finally have a site that matches the product — clear story, fast pages, and none of the usual agency runaround. It was live while we were still juggling everything else.",
    business: "Pool Bidder",
    url: "poolbidder.com",
  },
  {
    quote:
      "The design feels premium and the process was straightforward. We reviewed a real build instead of endless mockups, which kept us moving.",
    business: "Margaritas.ai",
    url: "margaritas.ai",
  },
  {
    quote:
      "Referrals and bids land better because the site finally looks like the company we run. Straight talk, fast execution, no fluff.",
    business: "May Construction",
    url: "may.construction",
  },
];

const Testimonials = () => (
  <section id="testimonials" className="bg-cream py-24 lg:py-32">
    <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
      <div className="text-center max-w-[820px] mx-auto">
        <div className="eyebrow uppercase text-[13px] font-semibold text-amber tracking-[0.18em] mb-5">Client voices</div>
        <h2 className="font-display font-semibold text-[40px] sm:text-[48px] lg:text-[52px] display-tight balance">
          What clients are saying.
        </h2>
        <p className="mt-4 text-[17px] text-ink/70 pretty">
          Summarized from recent feedback after we shipped sites for these brands.
        </p>
      </div>
      <div className="mt-16 grid md:grid-cols-3 gap-6 lg:gap-8">
        {CLIENT_TESTIMONIALS.map((t) => (
          <div key={t.url} className="bg-white border border-rule rounded-2xl p-8 lg:p-10 flex flex-col">
            <div className="flex gap-1 text-amber mb-4">
              {[...Array(5)].map((_, i) => (
                <I.Star key={i} className="w-4 h-4" />
              ))}
            </div>
            <div className="font-display font-bold text-[48px] leading-none text-amber/25 -mb-2">"</div>
            <p className="italic-fraunces text-[19px] sm:text-[20px] leading-[1.55] text-ink/90 flex-1">{t.quote}</p>
            <div className="my-6 h-px bg-rule" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber/12 border border-amber/25 flex items-center justify-center font-display font-semibold text-[15px] text-amber">
                {t.business.charAt(0)}
              </div>
              <div>
                <div className="text-[15px] font-semibold">{t.business}</div>
                <a
                  href={`https://${t.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-muted hover:text-amber transition-colors link-u"
                >
                  {t.url}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ———————————————————————————————————————————————
// Final CTA
// ———————————————————————————————————————————————
const FinalCTA = () => (
  <section className="bg-forest text-cream relative overflow-hidden">
    <div aria-hidden className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full bg-amber/10 blur-3xl" />
    <div aria-hidden className="absolute -bottom-40 -right-40 w-[480px] h-[480px] rounded-full bg-amber/5 blur-3xl" />
    <div className="relative max-w-[900px] mx-auto px-6 lg:px-10 py-32 lg:py-36 text-center">
      <div className="eyebrow uppercase text-[13px] font-semibold text-amber tracking-[0.2em] mb-6">Ready?</div>
      <h2 className="font-display font-semibold text-[56px] sm:text-[72px] lg:text-[80px] display-tight balance leading-[1.02]">
        Want one?
      </h2>
      <p className="mt-6 text-[20px] sm:text-[22px] text-cream/75 max-w-[560px] mx-auto pretty">
        Book a 20‑minute call. We'll have your website built and ready when we hop on.
      </p>
      <a href={BOOKING_URL} className="mt-12 inline-flex items-center gap-2.5 h-16 px-12 rounded-full bg-amber text-white font-semibold text-[18px] hover:bg-[#B4471A] transition-colors">
        Get my free website <I.ArrowR className="w-5 h-5"/>
      </a>
    </div>
  </section>
);

// ———————————————————————————————————————————————
// Footer
// ———————————————————————————————————————————————
const Footer = () => (
  <footer className="bg-ink text-cream">
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
      <div className="grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦊</span>
            <span className="font-display font-semibold text-[24px]">Foxes<span className="text-amber">.</span>ai</span>
          </div>
          <p className="mt-4 text-[14px] text-cream/60 max-w-[280px]">Stunning websites for local businesses.</p>
        </div>
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-amber mb-5">Explore</div>
          <ul className="space-y-3">
            {[["Work","#work"],["About","#about"],["Pricing","#pricing"],["FAQ","#faq"],["Our pitch",LANDER_URL],["DIY setup guide",DIY_URL]].map(([l,h]) => (
              <li key={l}><a href={h} className="text-[15px] text-cream hover:text-amber transition-colors link-u">{l}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-amber mb-5">Get in touch</div>
          <ul className="space-y-3">
            <li><a href={BOOKING_URL} className="text-[15px] text-cream hover:text-amber transition-colors link-u">Book a call</a></li>
            <li><a href="mailto:patrizio@foxes.ai" className="text-[15px] text-cream hover:text-amber transition-colors link-u">Email us</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-[13px] text-cream/50">© 2026 Foxes.ai</div>
        <div className="flex items-center gap-6 text-[13px] text-cream/50">
          <a href="#" className="hover:text-cream link-u">Privacy</a>
          <a href="#" className="hover:text-cream link-u">Terms</a>
        </div>
      </div>
    </div>
  </footer>
);

// ———————————————————————————————————————————————
// App
// ———————————————————————————————————————————————
const App = () => (
  <div className="min-h-screen bg-cream text-ink">
    <Header />
    <Hero />
    <Capabilities />
    <Founder />
    <Work />
    <Included />
    <HowItWorks />
    <FAQ />
    <Testimonials />
    <FinalCTA />
    <Footer />
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
