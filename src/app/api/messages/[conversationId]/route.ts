import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { addMessage, getConversationById, listMessages } from "@/lib/models";

async function assertParticipant(conversationId: string, userId: string) {
  const conversation = getConversationById(conversationId);
  if (!conversation) return null;
  if (conversation.buyerId !== userId && conversation.sellerId !== userId) return null;
  return conversation;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

  const { conversationId } = await params;
  const conversation = await assertParticipant(conversationId, session.userId);
  if (!conversation) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const messages = listMessages(conversationId);
  return NextResponse.json({ conversation, messages });
}

const schema = z.object({ content: z.string().min(1).max(2000) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

  const { conversationId } = await params;
  const conversation = await assertParticipant(conversationId, session.userId);
  if (!conversation) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Message invalide" }, { status: 400 });
  }

  const message = addMessage(conversationId, session.userId, parsed.data.content);
  return NextResponse.json({ message });
}
