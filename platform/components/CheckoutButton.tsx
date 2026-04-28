"use client";

import { useState } from "react";

export function CheckoutButton({ leadId }: { leadId: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function go() {
    setMsg(null);
    setLoading(true);
    const res = await fetch("/api/checkout/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    });
    const j = (await res.json()) as { url?: string; error?: string };
    setLoading(false);
    if (!res.ok || !j.url) {
      setMsg(j.error || "Could not open checkout.");
      return;
    }
    window.location.href = j.url;
  }

  return (
    <div>
      <button
        type="button"
        onClick={go}
        disabled={loading}
        className="mt-10 inline-flex rounded-full bg-amber px-10 py-4 text-[17px] font-semibold text-white shadow hover:bg-[#B4471A] transition-colors disabled:opacity-40"
      >
        {loading ? "Connecting to Stripe…" : "Activate hosting · $197/mo"}
      </button>
      {msg && <p className="mt-4 text-amber text-[14px] font-medium">{msg}</p>}
    </div>
  );
}
