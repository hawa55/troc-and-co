import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";
import { getSession } from "@/lib/auth";

// NOTE : stockage sur disque local — parfait pour développer et pour un
// hébergement avec disque persistant (VPS, Render). Sur Vercel (serverless),
// il faudra brancher un stockage type Cloudflare R2 / Supabase Storage /
// AWS S3 (voir README section "Passer en production").

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
  }

  const isImage = ALLOWED_IMAGE.includes(file.type);
  const isVideo = ALLOWED_VIDEO.includes(file.type);

  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: "Format non supporté (JPEG, PNG, WEBP, MP4, WEBM, MOV uniquement)" },
      { status: 400 }
    );
  }

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: "Image trop lourde (8 Mo max)" }, { status: 400 });
  }
  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return NextResponse.json({ error: "Vidéo trop lourde (50 Mo max)" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "data", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadsDir, filename), buffer);

 return NextResponse.json({ url: \/api/files/${filename}`, type: isVideo ? "video" : "image" });
}
