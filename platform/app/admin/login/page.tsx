"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      setErr("Wrong password.");
      return;
    }
    router.push("/admin/leads");
    router.refresh();
  }

  return (
    <main className="min-h-screen grain flex items-center justify-center px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-rule bg-white p-8 shadow-sm"
      >
        <h1 className="font-display text-xl font-semibold">Team login</h1>
        <label className="mt-6 block text-[13px] font-medium text-muted">
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-rule px-3 py-2.5 text-[16px]"
          />
        </label>
        {err && <p className="mt-4 text-[14px] text-amber">{err}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="mt-8 w-full rounded-full bg-ink py-3 text-[15px] font-semibold text-cream hover:bg-forest transition-colors disabled:opacity-40"
        >
          {loading ? "Signing in…" : "Continue"}
        </button>
      </form>
    </main>
  );
}
