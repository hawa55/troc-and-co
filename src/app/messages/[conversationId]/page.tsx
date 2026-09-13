import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getConversationById, getListingById, listMessages } from "@/lib/models";
import MessageThread from "@/components/MessageThread";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { conversationId } = await params;
  const conversation = getConversationById(conversationId);
  if (!conversation) notFound();
  if (conversation.buyerId !== session.userId && conversation.sellerId !== session.userId) {
    notFound();
  }

  const listing = getListingById(conversation.listingId);
  const messages = listMessages(conversationId);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      {listing && (
        <Link href={`/listings/${listing.id}`} className="block mb-4 group">
          <p className="text-xs text-ink/50">À propos de :</p>
          <p className="font-medium group-hover:text-market transition-colors">{listing.title}</p>
        </Link>
      )}
      <MessageThread
        conversationId={conversationId}
        initialMessages={messages}
        currentUserId={session.userId}
      />
    </div>
  );
}
