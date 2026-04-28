import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe-server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!whSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, whSecret);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const leadId =
      (session.metadata?.lead_id as string) ||
      (session.client_reference_id as string);
    const subId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;
    if (leadId) {
      await supabase
        .from("leads")
        .update({
          funnel_stage: "closed_won",
          stripe_customer_id: customerId ?? null,
          stripe_subscription_id: subId ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", leadId);
    }
  }

  return NextResponse.json({ received: true });
}
