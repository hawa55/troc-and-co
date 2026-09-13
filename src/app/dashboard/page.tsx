import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listListingsBySeller } from "@/lib/models";
import ListingCard from "@/components/ListingCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const listings = listListingsBySeller(session.userId);

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Mes annonces</h1>
        <Link
          href="/listings/new"
          className="rounded-full bg-market text-paper px-4 py-2 font-medium hover:bg-market-dark transition-colors text-sm"
        >
          + Nouvelle annonce
        </Link>
      </div>

      {listings.length === 0 ? (
        <p className="text-ink/50 text-center py-16">
          Tu n&apos;as pas encore d&apos;annonce.{" "}
          <Link href="/listings/new" className="text-market underline">
            Dépose la première
          </Link>
          .
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
