import Link from "next/link";

type Listing = {
  id: string;
  title: string;
  price: number;
  photos: string;
  category: string;
  condition: string;
  status: string;
};

export default function ListingCard({ listing }: { listing: Listing }) {
  const photos: string[] = JSON.parse(listing.photos || "[]");
  const cover = photos[0];

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block border-2 border-ink/10 bg-white/40 hover:border-market transition-colors"
    >
      <div className="aspect-square bg-ink/5 relative overflow-hidden">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30 text-sm">
            Pas de photo
          </div>
        )}
        {listing.status === "sold" && (
          <div className="absolute top-2 left-2 bg-ink text-paper text-xs font-medium px-2 py-1 rotate-[-3deg]">
            Vendu
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-medium truncate">{listing.title}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="tag-price bg-mustard/60 px-2 py-0.5 text-sm font-semibold">
            {listing.price.toFixed(2)} €
          </span>
          <span className="text-xs text-ink/50">{listing.condition}</span>
        </div>
      </div>
    </Link>
  );
}
