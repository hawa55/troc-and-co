import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { createOrder, getListingById, setOrderStripeSession } from "@/lib/models";
import { stripe } from "@/lib/stripe";

const schema = z.object({ listingId: z.string() });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const listing = getListingById(parsed.data.listingId);
  if (!listing) {
    return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
  }
  if (listing.status !== "available") {
    return NextResponse.json({ error: "Cet article n'est plus disponible" }, { status: 400 });
  }
  if (listing.sellerId === session.userId) {
    return NextResponse.json({ error: "Tu ne peux pas acheter ton propre article" }, { status: 400 });
  }

  const order = createOrder({
    listingId: listing.id,
    buyerId: session.userId,
    sellerId: listing.sellerId,
    amount: listing.price,
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: listing.title },
            unit_amount: Math.round(listing.price * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/listings/${listing.id}?paiement=succes`,
      cancel_url: `${baseUrl}/listings/${listing.id}?paiement=annule`,
      metadata: { orderId: order.id, listingId: listing.id },
    });

    setOrderStripeSession(order.id, checkoutSession.id);

    return NextResponse.json({ url: checkoutSession.url });
  } catch {
    return NextResponse.json(
      {
        error:
          "Paiement indisponible : configure une vraie clé Stripe (STRIPE_SECRET_KEY) dans .env pour activer le paiement en ligne.",
      },
      { status: 500 }
    );
  }
}
