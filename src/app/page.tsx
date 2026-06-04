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
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("emochi-theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : systemPrefersDark
          ? "dark"
          : "light";

    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("emochi-theme", theme);
  }, [theme]);

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
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8 sm:px-6 sm:py-10">
      <section className="flex items-start justify-between gap-4 border-b border-[hsl(var(--border))] pb-6">
        <div>
          <p className="text-sm font-medium text-muted">Supabase Realtime</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Emochi Live
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted sm:text-base">
            Nachrichten senden und in Echtzeit auf allen verbundenen Clients anzeigen.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          className="rounded-full border border-[hsl(var(--border))] bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-surfaceStrong"
          aria-label="Farbschema wechseln"
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </section>

      <section className="mt-8 rounded-3xl border border-[hsl(var(--border))] bg-surface p-5 shadow-sm sm:p-6">
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
          <input
            className="min-h-12 flex-1 rounded-2xl border border-[hsl(var(--border))] bg-transparent px-4 text-base outline-none placeholder:text-muted focus:border-text"
            maxLength={280}
            placeholder="Nachricht eingeben"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <button
            className="min-h-12 rounded-2xl bg-text px-5 font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Sende..." : "Senden"}
          </button>
        </form>

        <p className="mt-3 text-sm text-muted">{status}</p>

        <div className="mt-8 space-y-3">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] px-4 py-8 text-center text-sm text-muted">
              Noch keine Nachrichten.
            </div>
          ) : (
            messages.map((message) => (
              <article
                key={message.id}
                className="rounded-2xl border border-[hsl(var(--border))] bg-surfaceStrong px-4 py-3"
              >
                <p className="text-base">{message.content}</p>
                <p className="mt-2 text-xs text-muted">
                  {new Date(message.created_at).toLocaleString("de-DE")}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
