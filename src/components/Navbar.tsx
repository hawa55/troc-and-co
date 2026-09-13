"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SessionUser = { userId: string; name: string; email: string } | null;

export default function Navbar() {
  const [user, setUser] = useState<SessionUser>(null);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .finally(() => setLoaded(true));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b-2 border-ink/10 bg-paper sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-2xl tracking-tight text-ink">
          Troc<span className="text-stamp">&</span>Co
        </Link>

        <div className="flex items-center gap-3 text-sm">
          {loaded && user ? (
            <>
              <Link
                href="/listings/new"
                className="rounded-full bg-market text-paper px-4 py-2 font-medium hover:bg-market-dark transition-colors"
              >
                Déposer une annonce
              </Link>
              <Link href="/messages" className="px-3 py-2 hover:underline">
                Messages
              </Link>
              <Link href="/dashboard" className="px-3 py-2 hover:underline">
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-ink/60 hover:text-ink transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : loaded ? (
            <>
              <Link href="/login" className="px-3 py-2 hover:underline">
                Connexion
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-ink text-paper px-4 py-2 font-medium hover:bg-ink/80 transition-colors"
              >
                Créer un compte
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
