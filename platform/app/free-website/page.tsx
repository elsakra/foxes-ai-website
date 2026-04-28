import { Suspense } from "react";
import type { Metadata } from "next";
import { FunnelWizard } from "@/components/FunnelWizard";

export const metadata: Metadata = {
  title: "Claim your free website build — Foxes.ai",
  description:
    "Enter your business. We kick off fast, build in ~48 hours, hosting from $197/mo or DIY.",
};

export default function FreeWebsitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center grain text-muted">
          Loading…
        </div>
      }
    >
      <FunnelWizard />
    </Suspense>
  );
}
