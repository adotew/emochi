type EmojiCardProps = {
  emoji: string;
  hint?: string | null;
};

export function EmojiCard({ emoji, hint }: EmojiCardProps) {
  return (
    <section className="rounded-3xl p-6 text-center shadow-sm sm:p-8">
      <div className="mt-6 select-none text-[5rem] leading-none sm:text-[7rem] md:text-[8rem]">
        {emoji}
      </div>
      {hint ? (
        <div className="mt-8 rounded-2xl border border-[hsl(var(--border))] bg-surface px-4 py-3 text-left">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
            Hinweis
          </p>
          <p className="mt-2 text-sm text-muted sm:text-base">{hint}</p>
        </div>
      ) : null}
    </section>
  );
}
