import Link from "next/link";
import { listListings } from "@/lib/models";
import { CATEGORIES } from "@/lib/constants";
import ListingCard from "@/components/ListingCard";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const listings = listListings({ search: params.q, category: params.category });

  return (
    <div className="mx-auto max-w-6xl px-5">
      <section className="py-14 border-b-2 border-ink/10">
        <h1 className="font-display text-4xl md:text-5xl leading-tight max-w-2xl">
          Vends en une minute. Achète en confiance.
        </h1>
        <p className="mt-4 text-ink/70 max-w-xl">
          Photo ou vidéo, tu choisis. Notre IA rédige ton annonce à ta place.
          Paiement sécurisé par carte, sans frais cachés.
        </p>
        <Link
          href="/listings/new"
          className="inline-block mt-6 rounded-full bg-stamp text-paper px-6 py-3 font-medium hover:bg-stamp/90 transition-colors"
        >
          Déposer ma première annonce
        </Link>
      </section>

      <section className="py-8">
        <form className="flex flex-wrap gap-3 items-center mb-6">
          <input
            type="text"
            name="q"
            defaultValue={params.q}
            placeholder="Chercher un article…"
            className="border-2 border-ink/15 bg-white/60 px-4 py-2 flex-1 min-w-[200px] focus:outline-none focus:border-market"
          />
          <select
            name="category"
            defaultValue={params.category || ""}
            className="border-2 border-ink/15 bg-white/60 px-4 py-2 focus:outline-none focus:border-market"
          >
            <option value="">Toutes catégories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="border-2 border-ink px-5 py-2 font-medium hover:bg-ink hover:text-paper transition-colors"
          >
            Chercher
          </button>
        </form>

        {listings.length === 0 ? (
          <div className="text-center py-20 text-ink/50">
            <p className="font-display text-2xl mb-2">Rien à afficher pour l&apos;instant</p>
            <p>Sois le premier à déposer une annonce !</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-16">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
