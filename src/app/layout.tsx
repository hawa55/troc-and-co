import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Troc&Co — Achète et vends entre particuliers",
  description:
    "La marketplace de seconde main qui simplifie la vente : photo, vidéo, et l'IA écrit l'annonce à ta place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t-2 border-ink/10 mt-16">
          <div className="mx-auto max-w-6xl px-5 py-8 text-sm text-ink/60 flex justify-between">
            <span>Troc&amp;Co — projet en construction 🚧</span>
            <span>Version MVP</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
