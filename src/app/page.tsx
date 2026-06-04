"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { supabase } from "@/lib/supabase";

type Message = {
  id: number;
  content: string;
  created_at: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("Verbunden mit Supabase Realtime.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("id, content, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        setStatus("Initiales Laden fehlgeschlagen.");
        return;
      }

      setMessages(data);
    }

    loadMessages();

    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const nextMessage = payload.new as Message;

          setMessages((current) => {
            if (current.some((message) => message.id === nextMessage.id)) {
              return current;
            }

            return [nextMessage, ...current].slice(0, 20);
          });
          setStatus("Neue Nachricht in Echtzeit empfangen.");
        },
      )
      .subscribe((subscriptionStatus) => {
        if (subscriptionStatus === "SUBSCRIBED") {
          setStatus("Realtime aktiv.");
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const content = value.trim();

    if (!content) {
      setStatus("Bitte Text eingeben.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("messages").insert({ content });

    if (error) {
      setStatus("Speichern fehlgeschlagen.");
      setIsSubmitting(false);
      return;
    }

    setValue("");
    setStatus("Nachricht gesendet.");
    setIsSubmitting(false);
  };

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-4 py-10 sm:px-6">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[10%] top-[12%] h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-[10%] right-[8%] h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl shadow-black/20 backdrop-blur xl:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-300">
          Supabase Realtime
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
          Emochi Live
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
          Ein Eingabefeld, ein Submit-Button und alle Eintraege erscheinen sofort auf jedem verbundenen Client.
        </p>

        <form className="mt-8 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
          <input
            className="min-h-14 flex-1 rounded-2xl border border-white/15 bg-slate-950/60 px-5 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-accent"
            maxLength={280}
            placeholder="Nachricht eingeben"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <button
            className="min-h-14 rounded-2xl bg-accent px-6 font-bold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Sende..." : "Submit"}
          </button>
        </form>

        <p className="mt-3 text-sm text-slate-300">{status}</p>

        <div className="mt-8 space-y-3">
          {messages.map((message) => (
            <article
              key={message.id}
              className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3"
            >
              <p className="text-base text-white">{message.content}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">
                {new Date(message.created_at).toLocaleString("de-DE")}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
