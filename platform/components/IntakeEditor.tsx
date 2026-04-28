"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";

export function IntakeEditor({
  leadId,
  initialIntake,
}: {
  leadId: string;
  initialIntake: Record<string, unknown>;
}) {
  const router = useRouter();
  const [text, setText] = useState(() => JSON.stringify(initialIntake, null, 2));
  const [err, setErr] = useState<string | null>(null);
  const [pendingSave, saveTrans] = useTransition();
  const [pendingGen, genTrans] = useTransition();

  const parsed = useMemo(() => {
    try {
      return JSON.parse(text) as Record<string, unknown>;
    } catch {
      return null;
    }
  }, [text]);

  function save(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!parsed) {
      setErr("Fix JSON syntax.");
      return;
    }
    saveTrans(async () => {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (!res.ok) {
        setErr("Save failed");
        return;
      }
      router.refresh();
    });
  }

  function generate(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    genTrans(async () => {
      const res = await fetch("/api/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr((j as { error?: string }).error || "Generate failed");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="space-y-3">
        <label className="block text-[13px] font-medium text-muted">
          Kickoff intake (JSON — replace with bespoke form UI later)
          <textarea
            rows={22}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-2 w-full rounded-xl border border-rule p-4 font-mono text-[13px] leading-relaxed"
          />
        </label>
        {err && <p className="text-amber font-medium">{err}</p>}
        <button
          type="submit"
          disabled={pendingSave || !parsed}
          className="rounded-full bg-ink px-8 py-3 font-semibold text-cream hover:bg-forest transition-colors disabled:opacity-40"
        >
          {pendingSave ? "Saving…" : "Save intake to Supabase"}
        </button>
      </form>

      <form onSubmit={generate}>
        <button
          type="submit"
          disabled={pendingGen || !parsed || Object.keys(parsed).length === 0}
          className="rounded-full border border-forest px-8 py-3 font-semibold text-forest hover:bg-cream transition-colors disabled:opacity-40"
        >
          {pendingGen ? "Calling Claude…" : "Generate draft copy (Claude)"}
        </button>
      </form>
    </div>
  );
}
