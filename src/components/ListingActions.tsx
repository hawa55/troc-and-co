"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ListingActions({
  listingId,
  isOwner,
  isAvailable,
  isLoggedIn,
}: {
  listingId: string;
  isOwner: boolean;
  isAvailable: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (isOwner) {
    return (
      <p className="text-sm text-ink/50 border-2 border-ink/10 px-4 py-3">
        C&apos;est ton annonce — retrouve-la dans{" "}
        <a href="/dashboard" className="underline">
          ton tableau de bord
        </a>
        .
      </p>
    );
  }

  if (!isLoggedIn) {
    return (
      <a
        href="/login"
        className="block text-center rounded-full bg-ink text-paper px-5 py-3 font-medium hover:bg-ink/80 transition-colors"
      >
        Se connecter pour acheter ou contacter le vendeur
      </a>
    );
  }

  async function handleBuy() {
    setBuying(true);
    setError(null);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    const data = await res.json();
    setBuying(false);
    if (!res.ok) {
      setError(data.error || "Une erreur est survenue");
      return;
    }
    window.location.href = data.url;
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError(null);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, message }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) {
      setError(data.error || "Une erreur est survenue");
      return;
    }
    setSent(true);
    setMessage("");
    setTimeout(() => router.push(`/messages/${data.conversationId}`), 800);
  }

  return (
    <div className="space-y-4">
      {isAvailable && (
        <button
          onClick={handleBuy}
          disabled={buying}
          className="w-full rounded-full bg-stamp text-paper px-5 py-3 font-medium hover:bg-stamp/90 transition-colors disabled:opacity-50"
        >
          {buying ? "Redirection…" : "Acheter maintenant (paiement sécurisé)"}
        </button>
      )}

      <form onSubmit={handleSendMessage} className="space-y-2">
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Pose une question au vendeur…"
          className="w-full border-2 border-ink/15 bg-white/60 px-4 py-2 focus:outline-none focus:border-market"
        />
        <button
          type="submit"
          disabled={sending || sent}
          className="w-full border-2 border-ink px-5 py-2.5 font-medium hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
        >
          {sent ? "Message envoyé ✓" : sending ? "Envoi…" : "Contacter le vendeur"}
        </button>
      </form>

      {error && <p className="text-stamp text-sm">{error}</p>}
    </div>
  );
}
