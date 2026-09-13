import { NextRequest, NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/models";
import { stripe } from "@/lib/stripe";

// Configure cette URL (https://tondomaine.com/api/webhook) dans le dashboard
// Stripe > Développeurs > Webhooks, avec l'événement "checkout.session.completed".
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string };
    markOrderPaid(session.id);
  }

  return NextResponse.json({ received: true });
}
