import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { createListing, listListings } from "@/lib/models";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("q") || undefined;
  const listings = listListings({ category, search });
  return NextResponse.json({ listings });
}

const schema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères").max(100),
  description: z.string().min(10, "Décris un peu plus l'article (10 caractères min.)").max(2000),
  price: z.number().positive("Le prix doit être positif"),
  category: z.string().min(1, "Choisis une catégorie"),
  condition: z.string().min(1, "Précise l'état de l'article"),
  photos: z.array(z.string()).min(1, "Ajoute au moins une photo ou une vidéo"),
  video: z.string().nullable().optional(),
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

  const listing = createListing({ ...parsed.data, sellerId: session.userId });
  return NextResponse.json({ listing });
}
