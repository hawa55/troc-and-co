import { notFound } from "next/navigation";
import { getListingById, getUserById } from "@/lib/models";
import { getSession } from "@/lib/auth";
import ListingActions from "@/components/ListingActions";

export const dynamic = "force-dynamic";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = getListingById(id);
  if (!listing) notFound();

  const seller = getUserById(listing.sellerId);
  const session = await getSession();
  const photos: string[] = JSON.parse(listing.photos || "[]").filter(
    (p: string) => p !== listing.video
  );

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square bg-ink/5 border-2 border-ink/10 overflow-hidden">
            {photos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos[0]} alt={listing.title} className="w-full h-full object-cover" />
            ) : listing.video ? (
              <video src={listing.video} controls className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink/30">
                Pas de visuel
              </div>
            )}
          </div>
          {(photos.length > 1 || (listing.video && photos.length > 0)) && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {photos.slice(1).map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p}
                  src={p}
                  alt=""
                  className="w-20 h-20 object-cover border-2 border-ink/10 flex-shrink-0"
                />
              ))}
              {listing.video && photos.length > 0 && (
                <div className="w-20 h-20 border-2 border-market bg-market/10 flex items-center justify-center text-xs flex-shrink-0">
                  🎬 Vidéo
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <span className="text-xs uppercase tracking-wide text-ink/50">{listing.category}</span>
          <h1 className="font-display text-3xl mt-1">{listing.title}</h1>
          <span className="tag-price bg-mustard/60 px-3 py-1 text-xl font-semibold inline-block mt-3">
            {listing.price.toFixed(2)} €
          </span>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex gap-2">
              <span className="font-medium">État :</span>
              <span>{listing.condition}</span>
            </div>
            {seller && (
              <div className="flex gap-2">
                <span className="font-medium">Vendeur :</span>
                <span>
                  {seller.name}
                  {seller.city ? ` · ${seller.city}` : ""}
                </span>
              </div>
            )}
          </div>

          <p className="mt-6 whitespace-pre-wrap text-ink/80 leading-relaxed">
            {listing.description}
          </p>

          <div className="mt-8">
            <ListingActions
              listingId={listing.id}
              isOwner={session?.userId === listing.sellerId}
              isAvailable={listing.status === "available"}
              isLoggedIn={!!session}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
