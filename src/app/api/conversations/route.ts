import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import {
  addMessage,
  getListingById,
  getOrCreateConversation,
  listConversationsForUser,
} from "@/lib/models";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  }
  const conversations = listConversationsForUser(session.userId);
  return NextResponse.json({ conversations });
}

const schema = z.object({
  listingId: z.string(),
  message: z.string().min(1, "Le message ne peut pas être vide").max(2000),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  const listing = getListingById(parsed.data.listingId);
  if (!listing) {
    return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
  }
  if (listing.sellerId === session.userId) {
    return NextResponse.json(
      { error: "Tu ne peux pas contacter ton propre article" },
      { status: 400 }
    );
  }

  const conversation = getOrCreateConversation(listing.id, session.userId, listing.sellerId);
  addMessage(conversation.id, session.userId, parsed.data.message);

  return NextResponse.json({ conversationId: conversation.id });
}
