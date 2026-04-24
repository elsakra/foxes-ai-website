const { useState, useEffect, useRef } = React;

const SWITCH_URL = "/build?from=diy";

// ———————————————————————————————————————————————
// Icons — minimal, brand-consistent
// ———————————————————————————————————————————————
const S = ({ d, className = "", stroke = 1.5, fill = "none" }) => (
  <svg viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{d}</svg>
);
const I = {
  Download: (p) => <S {...p} d={<><path d="M12 4v12M6 12l6 6 6-6M4 20h16"/></>} />,
  GitHub:   (p) => <S {...p} d={<><path d="M9 19c-4 1-4-2-6-2m12 5v-3.5a3 3 0 00-.9-2.1c2.97-.33 6.1-1.46 6.1-6.6a5.1 5.1 0 00-1.4-3.5 4.75 4.75 0 00-.1-3.5s-1.1-.3-3.6 1.3a12.3 12.3 0 00-6 0C7.6 2.5 6.5 2.8 6.5 2.8a4.75 4.75 0 00-.1 3.5 5.1 5.1 0 00-1.4 3.5c0 5.12 3.13 6.27 6.1 6.6a3 3 0 00-.9 2.1V22"/></>} />,
  Info:     (p) => <S {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/></>} />,
  Chev:     (p) => <S {...p} d={<><path d="M6 9l6 6 6-6"/></>} />,
  Copy:     (p) => <S {...p} d={<><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V6a2 2 0 012-2h10"/></>} />,
  Check:    (p) => <S {...p} d={<><path d="M5 12l5 5 9-10"/></>} />,
  Play:     (p) => <S {...p} d={<><path d="M6 4l14 8-14 8z"/></>} fill="currentColor" stroke="none" />,
  File:     (p) => <S {...p} d={<><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></>} />,
  Phone:    (p) => <S {...p} d={<><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M11 18h2"/></>} />,
  ArrowR:   (p) => <S {...p} d={<><path d="M5 12h14M13 6l6 6-6 6"/></>} />,
  Alert:    (p) => <S {...p} d={<><path d="M12 3l10 18H2z"/><path d="M12 10v4M12 18v.01"/></>} />,
};

// ———————————————————————————————————————————————
// Header (minimal)
// ———————————————————————————————————————————————
const Header = () => (
  <header className="border-b border-rule bg-cream sticky top-0 z-40 no-print">
    <div className="max-w-[1100px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
      <a href="/" className="flex items-center gap-2">
        <span className="text-xl leading-none">🦊</span>
        <span className="font-display font-semibold text-[20px] tracking-tight">Foxes<span className="text-amber">.</span>ai</span>
      </a>
      <a href={SWITCH_URL} className="text-[14px] font-medium text-amber link-u">
        Changed your mind? Switch to hosted →
      </a>
    </div>
  </header>
);

// ———————————————————————————————————————————————
// Hero
// ———————————————————————————————————————————————
const Hero = () => (
  <section className="pt-20 lg:pt-24 pb-14 lg:pb-16">
    <div className="max-w-[840px] mx-auto px-6 lg:px-10">
      <div className="eyebrow uppercase text-[13px] font-semibold text-amber tracking-[0.18em] mb-6">Your code is ready</div>
      <h1 className="font-display font-semibold display-tight balance text-[40px] sm:text-[52px] lg:text-[60px]">
        Your website, yours to deploy.
      </h1>
      <p className="mt-6 text-[20px] sm:text-[22px] leading-[1.55] text-ink/75 pretty max-w-[720px]">
        We've emailed you your code — all source files, assets, and a README. Everything you need to get your site live is below. If you get stuck, your free 15‑minute help call is at the bottom of this page.
      </p>
      <div className="mt-8 inline-flex items-start gap-3 p-4 rounded-xl bg-white border border-rule max-w-[520px] no-print">
        <I.Info className="w-5 h-5 text-forest shrink-0 mt-0.5" />
        <div className="text-[14px] leading-[1.5] text-ink/80">
          <strong className="font-semibold text-ink">Check your inbox.</strong> Your code was sent right after our call. Didn't get it? <a href="mailto:hi@foxes.ai" className="text-amber link-u font-medium">Email us</a> and we'll resend.
        </div>
      </div>
    </div>
  </section>
);

// ———————————————————————————————————————————————
// Honesty banner
// ———————————————————————————————————————————————
const Honesty = () => (
  <section className="bg-cream-2 border-y border-rule py-14">
    <div className="max-w-[840px] mx-auto px-6 lg:px-10">
      <div className="flex items-start gap-3">
        <I.Info className="w-5 h-5 text-forest mt-1 shrink-0" />
        <h2 className="font-display font-semibold text-[22px] lg:text-[24px] display-tight">
          Before you start — a straight‑up word on what's ahead.
        </h2>
      </div>
      <div className="mt-5 space-y-5 text-[17px] leading-[1.65] text-ink/90 pretty">
        <p>
          Self‑hosting a business website isn't just "put the files online." You'll need to set up hosting, register a domain, configure DNS, set up business email, install SSL, connect your Google Business Profile, wire up your booking and contact forms, configure analytics, and handle ongoing security updates and backups. Most of our DIY customers spend <strong className="font-semibold">20–40 hours</strong> on initial setup and <strong className="font-semibold">2–5 hours per month</strong> on maintenance after.
        </p>
        <p>
          It's completely doable. Plenty of business owners pull it off. But if you're reading this and you don't already feel comfortable with terms like <em>DNS records</em>, <em>SMTP</em>, or <em>SSL certificate</em>, it's worth knowing what you're walking into.
        </p>
      </div>
      <div className="mt-8 bg-white border border-rule rounded-xl p-6">
        <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">Worth noting</div>
        <p className="mt-3 text-[16px] leading-[1.65] text-ink/90">
          The $99/mo hosted option covers every item on this page — plus your .com domain, business email, security monitoring, daily backups, and ongoing updates. If at any point the setup below feels like more than you want to take on, just email us. Your setup fee stays waived.
        </p>
        <a href={SWITCH_URL} className="inline-block mt-4 text-[14px] font-medium text-amber link-u no-print">
          Switch to hosted instead →
        </a>
      </div>
    </div>
  </section>
);

// ———————————————————————————————————————————————
// Comparison table (with mobile stacked cards)
// ———————————————————————————————————————————————
const Comparison = () => {
  const rows = [
    ["Pick and set up a hosting provider",            "~2 hours research + $5–$25/mo",                "Included"],
    ["Register a .com domain",                         "~30 min + $12–$20/year",                       "Included — we register it for you"],
    ["Configure DNS records (A, CNAME, MX, TXT)",      "~1–3 hours, depending on host",                "Included"],
    ["Install and renew SSL certificate",              "~1 hour initial + renewals every 90 days",     "Included — auto‑renews"],
    ["Set up business email (hello@yourbusiness.com)", "~2 hours + $6–$12/user/mo via Google Workspace", "Included — up to 5 addresses"],
    ["Deploy the site code",                           "~2–4 hours (first time)",                      "Done automatically"],
    ["Connect your Google Business Profile",           "~1 hour + ongoing updates",                    "Done + optimized on the call"],
    ["Wire up the booking widget",                     "~2 hours + external service fees",             "Pre‑wired, ready on launch"],
    ["Wire up contact forms + email routing",          "~2 hours",                                     "Pre‑wired"],
    ["Set up Google Analytics or similar",             "~1 hour",                                      "Included + monthly report emailed to you"],
    ["Configure review request automation",            "~4 hours + Twilio/SMS service fees",           "Included"],
    ["Run daily backups",                              "Your responsibility (tool + storage)",         "Automatic, daily, off‑site"],
    ["Monitor security + patch vulnerabilities",       "Ongoing, ~2 hours/mo",                         "Automatic, 24/7"],
    ["Handle downtime alerts + fixes",                 "Your responsibility",                          "We get paged, we fix it"],
    ["Make content updates (new photos, hours, menu)", "You do it, or hire someone",                   "We do it for you"],
  ];
  const total = ["Total first‑month effort", "20–40 hours + ~$25–$60/mo in service fees", "$99/mo"];

  return (
    <section className="bg-white py-24 lg:py-28 border-b border-rule">
      <div className="max-w-[1000px] mx-auto px-6 lg:px-10">
        <div className="eyebrow uppercase text-[13px] font-semibold text-amber tracking-[0.18em] mb-5">The full picture</div>
        <h2 className="font-display font-semibold text-[36px] sm:text-[44px] lg:text-[48px] display-tight balance max-w-[780px]">
          Here's everything a live website actually needs, every month.
        </h2>
        <p className="mt-5 text-[19px] leading-[1.55] text-ink/70 pretty max-w-[720px]">
          Not trying to scare you — just making sure you see the full job before you start. Each item below is something your site needs someone to handle.
        </p>

        {/* Desktop table */}
        <div className="hidden md:block mt-14 overflow-hidden rounded-xl border border-rule">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-forest text-cream">
                <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.14em] w-[44%]">What needs to happen</th>
                <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.14em] w-[28%]">If you DIY</th>
                <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.14em] w-[28%]">If we host ($99/mo)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={`border-t border-rule ${i % 2 === 0 ? "bg-white" : "bg-cream"}`}>
                  <td className="px-6 py-5 text-[15px] font-medium text-ink">{r[0]}</td>
                  <td className="px-6 py-5 text-[15px] text-ink/75">{r[1]}</td>
                  <td className="px-6 py-5 text-[15px] text-forest font-medium">{r[2]}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-forest bg-cream-2">
                <td className="px-6 py-5 text-[15px] font-semibold text-ink">{total[0]}</td>
                <td className="px-6 py-5 text-[15px] font-semibold text-ink">{total[1]}</td>
                <td className="px-6 py-5 text-[15px] font-semibold text-amber">{total[2]}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile stacked cards */}
        <div className="md:hidden mt-10 space-y-4">
          {[...rows, total].map((r, i) => (
            <div key={i} className={`rounded-xl border border-rule p-5 ${i === rows.length ? "bg-cream-2 border-forest" : "bg-white"}`}>
              <div className={`text-[15px] font-semibold mb-3 ${i === rows.length ? "text-ink" : "text-ink"}`}>{r[0]}</div>
              <div className="grid grid-cols-1 gap-2 text-[14px]">
                <div><span className="text-[11px] uppercase tracking-[0.14em] text-muted block mb-0.5">If you DIY</span><span className={i === rows.length ? "font-semibold" : "text-ink/75"}>{r[1]}</span></div>
                <div><span className="text-[11px] uppercase tracking-[0.14em] text-muted block mb-0.5">If we host</span><span className={`${i === rows.length ? "font-semibold text-amber" : "text-forest font-medium"}`}>{r[2]}</span></div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-[17px] leading-[1.65] text-ink/80 pretty max-w-[720px]">
          Every line above is honest. Some people enjoy this work, and we respect that — which is why we give you the code. But if reading this list made your stomach tight, that's a real signal. Most of our customers hire us to handle it because the math works: at $99/mo, we're cheaper than the coffee it takes to do it yourself.
        </p>
        <a href={SWITCH_URL} className="inline-block mt-5 text-[14px] font-medium text-amber link-u no-print">
          Switch to hosted — setup fee waived →
        </a>
      </div>
    </section>
  );
};

// ———————————————————————————————————————————————
// Code block with copy button
// ———————————————————————————————————————————————
const CodeBlock = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative my-5">
      <pre className="font-mono text-[13px] leading-[1.7] bg-ink text-cream rounded-lg p-5 pr-14 overflow-x-auto">{code}</pre>
      <button onClick={copy} className="no-print absolute top-3 right-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-cream/10 hover:bg-cream/20 text-cream text-[12px] font-medium transition-colors">
        {copied ? <><I.Check className="w-3.5 h-3.5" />Copied!</> : <><I.Copy className="w-3.5 h-3.5" />Copy</>}
      </button>
    </div>
  );
};

// ———————————————————————————————————————————————
// Callouts
// ———————————————————————————————————————————————
const Callout = ({ kind = "warn", title, children }) => {
  const palette = {
    warn:  { bd: "border-amber", bg: "bg-amber/5", ic: "text-amber" },
    info:  { bd: "border-forest", bg: "bg-forest/5", ic: "text-forest" },
  }[kind];
  return (
    <div className={`my-5 border-l-4 ${palette.bd} ${palette.bg} rounded-r-lg p-5`}>
      <div className="flex items-start gap-3">
        <I.Alert className={`w-5 h-5 mt-0.5 shrink-0 ${palette.ic}`} />
        <div>
          {title && <div className="font-semibold text-[15px] text-ink mb-1">{title}</div>}
          <div className="text-[15px] leading-[1.6] text-ink/85">{children}</div>
        </div>
      </div>
    </div>
  );
};

// ———————————————————————————————————————————————
// Mini table inside steps
// ———————————————————————————————————————————————
const MiniTable = ({ head, rows }) => (
  <div className="my-5 overflow-x-auto rounded-lg border border-rule">
    <table className="w-full text-left text-[14px]">
      <thead>
        <tr className="bg-cream-2 border-b border-rule">
          {head.map((h, i) => <th key={i} className="px-4 py-3 font-semibold text-[12px] uppercase tracking-[0.12em] text-ink">{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className={`${i > 0 ? "border-t border-rule" : ""} ${i % 2 === 0 ? "bg-white" : "bg-cream"}`}>
            {r.map((c, j) => <td key={j} className="px-4 py-3 text-ink/85 align-top">{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ———————————————————————————————————————————————
// Step accordion (single-open)
// ———————————————————————————————————————————————
const Step = ({ n, title, time, isOpen, onToggle, children }) => (
  <div className={`bg-white border border-rule rounded-xl overflow-hidden transition-shadow ${isOpen ? "shadow-md open" : ""}`}>
    <button onClick={onToggle} className="w-full flex items-center gap-5 px-6 lg:px-8 py-5 lg:py-6 text-left">
      <div className="font-display font-semibold text-amber text-[28px] lg:text-[32px] display-tight leading-none tnum w-14 shrink-0">{n}</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-[19px] lg:text-[22px] display-tight pretty">{title}</h3>
      </div>
      <span className="hidden sm:inline-flex h-7 px-3 rounded-full bg-cream-2 border border-rule text-[12px] font-medium text-muted items-center shrink-0">{time}</span>
      <I.Chev className="chev w-5 h-5 text-muted shrink-0" />
    </button>
    <div className={`acc-body ${isOpen ? "open" : ""}`}>
      <div>
        <div className="px-6 lg:px-8 pb-10 pt-2 text-[16px] leading-[1.65] text-ink/85 max-w-none">
          {children}
        </div>
      </div>
    </div>
  </div>
);

// ———————————————————————————————————————————————
// Deployment guide
// ———————————————————————————————————————————————
const Guide = () => {
  const [open, setOpen] = useState(null);
  const toggle = (i) => setOpen(open === i ? null : i);
  const step = (i) => ({ isOpen: open === i, onToggle: () => toggle(i) });

  return (
    <section className="py-24 lg:py-28">
      <div className="max-w-[900px] mx-auto px-6 lg:px-10">
        <div className="eyebrow uppercase text-[13px] font-semibold text-amber tracking-[0.18em] mb-5">The step‑by‑step guide</div>
        <h2 className="font-display font-semibold text-[40px] sm:text-[48px] lg:text-[52px] display-tight balance max-w-[820px]">
          Every step, in order, with everything you need.
        </h2>
        <p className="mt-5 text-[19px] leading-[1.55] text-ink/70 pretty max-w-[720px]">
          Budget about a full weekend for the first time through. Skip nothing — each step depends on the one before it.
        </p>

        <div className="mt-14 space-y-4">
          <Step n="01" title="Choose a hosting provider" time="~2 hours" {...step(0)}>
            <p>Your hosting provider is the company that stores your site's files and serves them to visitors. For a statically built Foxes.ai site, modern git‑based hosts make this painless — you push code, they build and deploy.</p>
            <MiniTable
              head={["Provider", "Monthly cost", "Difficulty", "Best for"]}
              rows={[
                ["Netlify",           "$0–$19",  "Easy",          "Most DIY users"],
                ["Vercel",            "$0–$20",  "Easy",          "React/Next sites"],
                ["Cloudflare Pages",  "$0–$5",   "Moderate",      "Traffic‑heavy sites"],
                ["cPanel (Bluehost)", "$5–$15",  "Harder",        "Legacy setups"],
              ]}
            />
            <p>For most people, <strong>Netlify or Vercel</strong> is the right call. Both offer git‑based deployment — connect your GitHub repo, they'll auto‑build and publish on every push.</p>
            <ul className="list-disc pl-5 space-y-1.5 my-4">
              <li>Sign up with the email you want associated with billing</li>
              <li>Connect your GitHub account</li>
              <li>Add a payment method even on the free tier — prevents surprise downtime from limit hits</li>
            </ul>
            <Callout title="Free tiers have limits">
              Free tiers exist but often come with bandwidth caps. If your site gets real traffic, budget $10–$25/mo.
            </Callout>
          </Step>

          <Step n="02" title="Register your domain" time="~30 minutes" {...step(1)}>
            <p>Your domain is your address on the internet — <span className="font-mono text-[14px]">yourbusiness.com</span>. Never run a real business on a free subdomain; it hurts trust and SEO.</p>
            <p className="mt-4"><strong>Recommended registrars:</strong></p>
            <ul className="list-disc pl-5 space-y-1.5 my-3">
              <li><strong>Cloudflare Registrar</strong> — lowest wholesale pricing, no upsells</li>
              <li><strong>Namecheap</strong> — friendly UI, good for first‑timers</li>
            </ul>
            <p className="mt-4"><strong>Avoid:</strong> GoDaddy's aggressive upsells, any multi‑year contracts with auto‑renew traps, and "free privacy protection" pitches (it should be free by default in 2026).</p>
            <Callout kind="info" title="While you're there">
              Grab the .net variant and any obvious misspellings of your business name. They're cheap, and it stops competitors from buying them later.
            </Callout>
          </Step>

          <Step n="03" title="Configure DNS records" time="~1–3 hours" {...step(2)}>
            <p>DNS translates <span className="font-mono text-[14px]">yourbusiness.com</span> into the IP address your hosting lives at. Every domain needs a handful of records pointed at the right places.</p>
            <MiniTable
              head={["Type", "Name", "Value", "Purpose"]}
              rows={[
                ["A",     "@",    "<host IP>",              "Root domain → host"],
                ["CNAME", "www",  "yourbusiness.com",       "www → root"],
                ["MX",    "@",    "<mail provider MX>",     "Routes your email"],
                ["TXT",   "@",    "v=spf1 include:…",       "SPF — email deliverability"],
              ]}
            />
            <Callout title="Don't schedule your launch right after DNS changes">
              DNS changes can take up to 48 hours to propagate worldwide. Use <a className="text-amber link-u" href="https://dnschecker.org" target="_blank" rel="noopener">dnschecker.org</a> to verify before announcing.
            </Callout>
            <Callout title="DNS is the #1 DIY breakage">
              Mistakes here are the single most common reason self‑hosted sites break. Double‑check every record before saving.
            </Callout>
          </Step>

          <Step n="04" title="Deploy the code to your host" time="~2–4 hours (first time)" {...step(3)}>
            <p>Three common paths, ordered easiest to hardest:</p>
            <ol className="list-decimal pl-5 space-y-1.5 my-4">
              <li><strong>Netlify / Vercel</strong> (git‑based) — fork our repo, connect, done</li>
              <li><strong>Cloudflare Pages</strong> (git‑based) — similar, slightly more setup</li>
              <li><strong>cPanel / FTP</strong> (traditional) — upload built files manually</li>
            </ol>
            <p className="mt-4">For Netlify/Vercel: fork the GitHub repo we sent you, click "New site from Git", point at your fork, and enter these build settings:</p>
            <CodeBlock code={`npm install
npm run build`} />
            <p className="mt-4"><strong>If the build fails</strong>, the usual suspects are (a) a Node version mismatch — set Node 20 in host settings, and (b) missing environment variables — check the README for the list.</p>
            <Callout kind="info">
              The <span className="font-mono text-[14px]">README.md</span> in your repo has build settings specific to your site. Start there.
            </Callout>
          </Step>

          <Step n="05" title="Install your SSL certificate" time="~1 hour + renewals" {...step(4)}>
            <p>SSL/HTTPS is the padlock in the browser. Without it, modern browsers show scary warnings and Google ranks you lower. It's not optional.</p>
            <p className="mt-4"><strong>On Netlify/Vercel/Cloudflare:</strong> usually automatic via Let's Encrypt once DNS is pointed correctly. Verify under your site's "Domain" or "SSL" settings — should show "Provisioned".</p>
            <p className="mt-4"><strong>On traditional hosts:</strong> install manually via cPanel's AutoSSL or a Let's Encrypt plugin.</p>
            <Callout title="Set a calendar reminder">
              Let's Encrypt certs expire every 90 days. If auto‑renewal breaks silently, your site goes down and your Google rankings tank. Set a recurring 75‑day reminder to verify renewal.
            </Callout>
          </Step>

          <Step n="06" title="Set up business email" time="~2 hours" {...step(5)}>
            <p>Running your business off a gmail.com address signals "hobby" to customers. You want <span className="font-mono text-[14px]">hello@yourbusiness.com</span>.</p>
            <MiniTable
              head={["Provider", "Pricing", "Notes"]}
              rows={[
                ["Google Workspace", "$6/user/mo",         "Best overall — familiar UI, great spam filtering"],
                ["Zoho Mail",        "Free for 1, $1–$4/mo after", "Cheapest, slightly clunky UI"],
                ["Fastmail",         "$3–$5/user/mo",      "Privacy‑focused, great UX"],
              ]}
            />
            <p className="mt-4">You'll need to add four DNS record types (see Step 03): <strong>MX</strong> (where mail goes), <strong>SPF</strong>, <strong>DKIM</strong>, and <strong>DMARC</strong> (all three prove you're a legitimate sender).</p>
            <Callout title="Email deliverability is a rabbit hole">
              Skipping SPF/DKIM/DMARC means your emails land in spam. Don't skip them. Every provider has a step‑by‑step wizard — follow it exactly.
            </Callout>
          </Step>

          <Step n="07" title="Connect your Google Business Profile" time="~1 hour" {...step(6)}>
            <p>A majority of local searches happen on Google Maps, not traditional search. Your Google Business Profile (GBP) is often the first impression — and it's free.</p>
            <ul className="list-disc pl-5 space-y-1.5 my-4">
              <li><strong>Claim/verify</strong> your profile at <span className="font-mono text-[14px]">business.google.com</span> — usually via postcard or phone</li>
              <li><strong>Optimize</strong> categories, hours, services, photos (add 10+), and Q&amp;A</li>
              <li><strong>Link</strong> your new website URL under "Contact info"</li>
            </ul>
            <Callout kind="info" title="GBP is ongoing work">
              This isn't a one‑time task. Keep photos fresh, respond to reviews weekly, and post updates monthly. Neglected profiles get outranked.
            </Callout>
          </Step>

          <Step n="08" title="Wire up your forms, booking, and integrations" time="~4–6 hours total" {...step(7)}>
            <p><strong>Contact form → email routing.</strong> Use Formspree, Basin, or a small backend of your own. Get the form's <span className="font-mono text-[14px]">action</span> URL and paste it into the form tag in your repo. Test end‑to‑end before going live.</p>
            <p className="mt-4"><strong>Booking widget.</strong> Cal.com, Calendly, or SavvyCal all work. Create your account, set availability, and paste the embed code where the README indicates.</p>
            <p className="mt-4"><strong>Review request automation.</strong> The repo ships with a small script that texts happy customers a review link. You'll need a Twilio account (~$1/mo + ~$0.0075 per SMS) and a phone number. Add your credentials to the <span className="font-mono text-[14px]">.env</span> file.</p>
            <CodeBlock code={`TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FROM_NUMBER=+15555555555`} />
          </Step>

          <Step n="09" title="Set up analytics and monitoring" time="~2 hours" {...step(8)}>
            <p><strong>Google Analytics 4.</strong> Create a property at <span className="font-mono text-[14px]">analytics.google.com</span>, copy your Measurement ID (<span className="font-mono text-[14px]">G‑XXXX</span>), and paste it into <span className="font-mono text-[14px]">.env</span>.</p>
            <p className="mt-4"><strong>Uptime monitoring.</strong> UptimeRobot's free tier checks your site every 5 minutes and emails you if it goes down. Takes 10 minutes to set up.</p>
            <p className="mt-4"><strong>What to check weekly:</strong> traffic trend, form submissions received, any 404s or errors in GA's "Events" view.</p>
          </Step>

          <Step n="10" title="Ongoing maintenance checklist" time="~2–5 hours/month" {...step(9)}>
            <p>Most DIY site owners underestimate this part. Set a recurring calendar block — skipping months compounds into problems.</p>
            <Callout kind="info" title="Monthly checklist">
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Check for CMS/framework updates and apply them</li>
                <li>Verify backups are running</li>
                <li>Review analytics for anomalies</li>
                <li>Test contact form and booking flow end‑to‑end</li>
                <li>Renew any expiring SSL certs</li>
                <li>Monitor for broken links</li>
                <li>Review Google Business Profile insights</li>
              </ul>
            </Callout>
          </Step>
        </div>
      </div>
    </section>
  );
};

// ———————————————————————————————————————————————
// Reality check pivot
// ———————————————————————————————————————————————
const RealityCheck = () => (
  <section className="bg-forest text-cream py-24 lg:py-28">
    <div className="max-w-[760px] mx-auto px-6 lg:px-10 text-center">
      <div className="eyebrow uppercase text-[13px] font-semibold text-amber tracking-[0.2em] mb-6">Still with us?</div>
      <h2 className="font-display font-semibold text-[36px] sm:text-[44px] lg:text-[48px] display-tight balance leading-[1.1]">
        If you made it through that list and you're excited — you're our kind of person. Go build.
      </h2>
      <p className="mt-6 text-[19px] leading-[1.6] text-cream/80 pretty">
        If you made it through and you're quietly thinking "I don't have time for this" — that's also completely fair. A lot of business owners get here and realize their time is better spent running their business, not DNS records. If that's you, say the word and we'll handle everything for $99 a month. Your setup is already done.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center no-print">
        <a href={SWITCH_URL} className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-amber text-white text-[16px] font-semibold hover:bg-[#B4471A] transition-colors">
          Switch to hosted — $99/mo
        </a>
        <a href="#" className="inline-flex items-center justify-center h-14 px-8 rounded-full border border-cream/30 text-cream text-[16px] font-semibold hover:bg-cream/5 transition-colors">
          I've got it, continue with DIY
        </a>
      </div>
      <p className="mt-5 text-[13px] text-cream/60">Whichever you pick, we'll make it easy.</p>
    </div>
  </section>
);

// ———————————————————————————————————————————————
// Help resources
// ———————————————————————————————————————————————
const Help = () => {
  const cards = [
    { Ic: I.Play,  h: "Watch Patrizio deploy a site, end to end.",      b: "A 28‑minute screen recording walking through every step above on a real site. Pause, rewind, follow along.", cta: "Watch the walkthrough" },
    { Ic: I.File,  h: "Download the full PDF guide.",                    b: "Everything on this page, formatted for print or offline reference. 42 pages, plus a quick‑reference checklist.", cta: "Download PDF" },
    { Ic: I.Phone, h: "Stuck? Book a free 15‑minute help call.",         b: "If you hit a wall, grab a slot on our calendar. We'll hop on, figure it out, and send you on your way. No pitch — just help.", cta: "Book a help call" },
  ];
  return (
    <section className="bg-white py-24 lg:py-28 border-y border-rule">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
        <h2 className="font-display font-semibold text-[36px] sm:text-[44px] display-tight balance max-w-[720px]">
          If you get stuck — we've got you.
        </h2>
        <div className="mt-12 grid md:grid-cols-3 gap-5 lg:gap-6">
          {cards.map((c, i) => (
            <div key={i} className="rounded-xl border border-rule bg-cream p-7 lg:p-8 flex flex-col">
              <c.Ic className="w-6 h-6 text-amber" />
              <h3 className="mt-4 font-display font-semibold text-[22px] display-tight pretty">{c.h}</h3>
              <p className="mt-2 text-[15px] leading-[1.6] text-ink/75 flex-1">{c.b}</p>
              <a href="#" className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-amber link-u">{c.cta} →</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ———————————————————————————————————————————————
// Soft final CTA
// ———————————————————————————————————————————————
const SoftCTA = () => (
  <section className="py-16 no-print">
    <div className="max-w-[640px] mx-auto px-6 lg:px-10 text-center">
      <p className="text-[17px] leading-[1.65] text-ink/80 pretty">
        One last thing: if at any point over the next few weeks you decide you'd rather we just handle this, the door is always open. Your setup fee stays waived — forever.
      </p>
      <a href={SWITCH_URL} className="mt-5 inline-block text-[15px] font-medium text-amber link-u">
        Switch to hosted when you're ready →
      </a>
    </div>
  </section>
);

// ———————————————————————————————————————————————
// Footer
// ———————————————————————————————————————————————
const Footer = () => (
  <footer className="border-t border-rule bg-cream">
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-[14px] text-muted">
        <span>🦊</span>
        <span className="font-display font-semibold text-ink">Foxes<span className="text-amber">.</span>ai</span>
        <span className="ml-2">© 2026</span>
      </div>
      <div className="flex items-center gap-6 text-[14px] text-muted">
        <a href="#" className="hover:text-ink link-u">Privacy</a>
        <a href="#" className="hover:text-ink link-u">Terms</a>
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
    <Honesty />
    <Comparison />
    <Guide />
    <RealityCheck />
    <Help />
    <SoftCTA />
    <Footer />
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
