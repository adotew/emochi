type EmojiCardProps = {
  emoji: string;
};

export function EmojiCard({ emoji }: EmojiCardProps) {
  return (
    <section className="rounded-3xl p-6 text-center shadow-sm sm:p-8">
      <div className="mt-6 select-none text-[5rem] leading-none sm:text-[7rem] md:text-[8rem]">
        {emoji}
      </div>
    </section>
  );
}
