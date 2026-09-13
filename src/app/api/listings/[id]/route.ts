import { NextRequest, NextResponse } from "next/server";
import { getListingById, getUserById } from "@/lib/models";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = getListingById(id);
  if (!listing) {
    return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
  }
  const seller = getUserById(listing.sellerId);
  return NextResponse.json({
    listing,
    seller: seller ? { id: seller.id, name: seller.name, city: seller.city } : null,
  });
}
