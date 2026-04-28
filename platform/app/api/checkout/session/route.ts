import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe-server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let leadId: string;
  try {
    const j = (await req.json()) as { leadId?: string };
    if (!j.leadId) throw new Error("missing");
    leadId = j.leadId;
  } catch {
    return NextResponse.json({ error: "leadId required" }, { status: 400 });
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json(
      { error: "STRIPE_PRICE_ID not configured — create a $197/mo price in Stripe" },
      { status: 500 }
    );
  }

  const supabase = createServiceRoleClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .select("id, email, full_name")
    .eq("id", leadId)
    .single();
  if (error || !lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_ORIGIN || new URL(req.url).origin;
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/${leadId}?cancelled=1`,
    customer_email: lead.email,
    client_reference_id: leadId,
    metadata: { lead_id: leadId },
    subscription_data: {
      metadata: { lead_id: leadId },
    },
  });

  return NextResponse.json({ url: session.url });
}
