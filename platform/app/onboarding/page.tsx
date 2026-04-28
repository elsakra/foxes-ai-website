import { Suspense } from "react";
import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/OnboardingWizard";

export const metadata: Metadata = {
  title: "Claim your Foxes onboarding — Foxes.ai",
  description:
    "Locate your Maps listing and lock in concierge onboarding—kickoff begins within hours, previews in roughly 48 hours.",
};

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-muted">
          Loading…
        </div>
      }
    >
      <OnboardingWizard />
    </Suspense>
  );
}
