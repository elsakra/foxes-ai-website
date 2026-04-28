import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeSingleton) {
    const sk = process.env.STRIPE_SECRET_KEY;
    if (!sk) throw new Error("STRIPE_SECRET_KEY is not set");
    stripeSingleton = new Stripe(sk);
  }
  return stripeSingleton;
}
