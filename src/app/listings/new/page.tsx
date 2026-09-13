"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, CONDITIONS } from "@/lib/constants";

export default function NewListingPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'upload");
        continue;
      }
      if (data.type === "video") {
        setVideo(data.url);
      } else {
        setPhotos((prev) => [...prev, data.url]);
      }
    }
    setUploading(false);
    e.target.value = "";
  }

  function removePhoto(url: string) {
    setPhotos((prev) => prev.filter((p) => p !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (photos.length === 0 && !video) {
      setError("Ajoute au moins une photo ou une vidéo");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        price: parseFloat(price),
        category,
        condition,
        photos: photos.length > 0 ? photos : [video], // au moins un visuel exigé côté API
        video,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Une erreur est survenue");
      return;
    }
    router.push(`/listings/${data.listing.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-display text-3xl mb-2">Déposer une annonce</h1>
      <p className="text-ink/60 mb-8">
        Ajoute une photo ou une vidéo de ton article, remplis les infos, c&apos;est en ligne.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Photos et/ou vidéo</label>
          <div className="flex flex-wrap gap-3">
            {photos.map((url) => (
              <div key={url} className="relative w-24 h-24 border-2 border-ink/15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-stamp text-paper text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
            {video && (
              <div className="relative w-24 h-24 border-2 border-market flex items-center justify-center bg-market/10">
                <span className="text-xs text-market font-medium">🎬 Vidéo</span>
                <button
                  type="button"
                  onClick={() => setVideo(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-stamp text-paper text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            )}
            <label className="w-24 h-24 border-2 border-dashed border-ink/25 flex items-center justify-center cursor-pointer hover:border-market text-ink/40 text-xs text-center px-1">
              {uploading ? "Envoi…" : "+ Ajouter"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          <p className="text-xs text-ink/40 mt-2">
            Photos : JPEG/PNG/WEBP, 8 Mo max. Vidéo : MP4/WEBM/MOV, 50 Mo max.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Titre</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex : Blouson en cuir vintage taille M"
            className="w-full border-2 border-ink/15 bg-white/60 px-4 py-2 focus:outline-none focus:border-market"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Catégorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border-2 border-ink/15 bg-white/60 px-4 py-2 focus:outline-none focus:border-market"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">État</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full border-2 border-ink/15 bg-white/60 px-4 py-2 focus:outline-none focus:border-market"
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décris l'article : matière, taille, défauts éventuels…"
            className="w-full border-2 border-ink/15 bg-white/60 px-4 py-2 focus:outline-none focus:border-market"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Prix (€)</label>
          <input
            type="number"
            required
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border-2 border-ink/15 bg-white/60 px-4 py-2 focus:outline-none focus:border-market"
          />
        </div>

        {error && <p className="text-stamp text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full rounded-full bg-stamp text-paper px-5 py-3 font-medium hover:bg-stamp/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Publication…" : "Publier l'annonce"}
        </button>
      </form>
    </div>
  );
}
