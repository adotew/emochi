type EmojiCardProps = {
  emoji: string;
};

export function EmojiCard({ emoji }: EmojiCardProps) {
  return (
    <section className="animate-fadeSlide rounded-[2.25rem] border border-white/15 bg-surfaceStrong/90 p-6 text-center shadow-glow backdrop-blur-xl sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
        Welche Antwort steckt dahinter?
      </p>
      <div className="mt-6 animate-float select-none text-[5rem] leading-none sm:text-[7rem] md:text-[8rem]">
        {emoji}
      </div>
    </section>
  );
}
