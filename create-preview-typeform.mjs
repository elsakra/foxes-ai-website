const token = process.env.TYPEFORM_PERSONAL_TOKEN;
const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;

if (!token) {
  console.error("Missing TYPEFORM_PERSONAL_TOKEN. Do not commit personal tokens; pass it as an environment variable.");
  process.exit(1);
}

const hiddenFields = [
  "preview_lead_id",
  "event_id",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
  "source_page",
  "page_url",
  "page_path",
  "referrer",
];

const form = {
  title: "Foxes.ai Website Preview Request",
  type: "form",
  hidden: hiddenFields,
  settings: {
    language: "en",
    progress_bar: "proportion",
    show_progress_bar: true,
    meta: {
      title: "Get your website preview",
      description: "Answer a few quick questions so we can build your preview.",
    },
  },
  welcome_screens: [
    {
      ref: "welcome",
      title: "Get your free website preview.",
      properties: {
        description: "A few quick answers help us design something more beautiful and more likely to convert.",
        show_button: true,
        button_text: "Start",
      },
    },
  ],
  fields: [
    {
      ref: "business_name",
      title: "Business name?",
      type: "short_text",
      properties: {
        description: "We need this so the preview feels like it was made for your real business, not a generic template.",
      },
      validations: { required: true },
    },
    {
      ref: "email",
      title: "Best email?",
      type: "email",
      properties: {
        description: "We need this so we can send you the free website preview.",
      },
      validations: { required: true },
    },
    {
      ref: "what_they_sell",
      title: "What do you sell, and who buys it?",
      type: "long_text",
      properties: {
        description: "This helps us write the page around the customers you actually want. Example: emergency plumbing for homeowners in Austin.",
      },
      validations: { required: true },
    },
    {
      ref: "current_presence",
      title: "Do you already have a website or online listing?",
      type: "short_text",
      properties: {
        description: "If so, paste it here. We'll design one that's more beautiful and more likely to convert. Website, Google Maps, Instagram, Yelp, or leave blank.",
      },
      validations: { required: false },
    },
    {
      ref: "phone",
      title: "Best phone? Optional.",
      type: "phone_number",
      properties: {
        description: "Only if you want us to text/call if we have one quick question before building the preview.",
      },
      validations: { required: false },
    },
  ],
  thankyou_screens: [
    {
      ref: "thanks",
      title: "You're in. We'll send your preview within 24 hours.",
      properties: {
        show_button: true,
        button_text: "Back to Foxes.ai",
        button_mode: "redirect",
        redirect_url: "https://foxes.ai/preview.html",
        share_icons: false,
      },
    },
  ],
};

async function typeform(path, init = {}) {
  const res = await fetch(`https://api.typeform.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${init.method || "GET"} ${path} failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

const created = await typeform("/forms", {
  method: "POST",
  body: JSON.stringify(form),
});

if (makeWebhookUrl) {
  await typeform(`/forms/${created.id}/webhooks/make-preview-request`, {
    method: "PUT",
    body: JSON.stringify({
      url: makeWebhookUrl,
      enabled: true,
      verify_ssl: true,
    }),
  });
}

console.log(`Created Typeform: ${created.id}`);
console.log(`Set this in Vercel and .env.local: VITE_PREVIEW_TYPEFORM_ID=${created.id}`);
if (makeWebhookUrl) console.log("Connected Make.com webhook: make-preview-request");
else console.log("MAKE_WEBHOOK_URL was not set, so no webhook was connected.");
