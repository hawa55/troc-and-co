import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listConversationsForUser } from "@/lib/models";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const conversations = listConversationsForUser(session.userId);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="font-display text-3xl mb-8">Messages</h1>

      {conversations.length === 0 ? (
        <p className="text-ink/50 text-center py-16">Aucune conversation pour l&apos;instant.</p>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => {
            const photos: string[] = JSON.parse(c.listingPhotos || "[]");
            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className="flex items-center gap-4 border-2 border-ink/10 hover:border-market transition-colors p-3"
              >
                <div className="w-14 h-14 bg-ink/5 flex-shrink-0 overflow-hidden">
                  {photos[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photos[0]} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.listingTitle}</p>
                  <p className="text-sm text-ink/50">{c.listingPrice.toFixed(2)} €</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
