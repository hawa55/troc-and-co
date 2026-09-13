"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export default function MessageThread({
  conversationId,
  initialMessages,
  currentUserId,
}: {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Rafraîchit les messages toutes les 4 secondes (messagerie quasi temps réel, sans websocket).
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/messages/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [conversationId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    const res = await fetch(`/api/messages/${conversationId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setContent("");
    }
    setSending(false);
  }

  return (
    <div className="flex flex-col h-[60vh] border-2 border-ink/10">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => {
          const isMine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-2 text-sm ${
                  isMine ? "bg-market text-paper" : "bg-ink/5 text-ink"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="border-t-2 border-ink/10 p-3 flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écris un message…"
          className="flex-1 border-2 border-ink/15 bg-white/60 px-3 py-2 text-sm focus:outline-none focus:border-market"
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-full bg-ink text-paper px-5 py-2 text-sm font-medium hover:bg-ink/80 transition-colors disabled:opacity-50"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
