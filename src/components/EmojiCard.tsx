type EmojiCardProps = {
  emoji: string;
};

export function EmojiCard({ emoji }: EmojiCardProps) {
  return (
    <section className="rounded-3xl border border-[hsl(var(--border))] bg-surface p-6 text-center shadow-sm sm:p-8">
      <p className="text-sm font-medium text-muted">
        Welcher Begriff ist gemeint?
      </p>
      <div className="mt-6 select-none text-[5rem] leading-none sm:text-[7rem] md:text-[8rem]">
        {emoji}
      </div>
    </section>
  );
}
