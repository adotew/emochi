type CurrentPlayerProps = {
  name: string;
};

export function CurrentPlayer({ name }: CurrentPlayerProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-accent/30 bg-gradient-to-r from-accent/25 via-white/10 to-primary/20 px-6 py-5 text-center shadow-lg shadow-accent/10">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-200">
        Aktueller Spieler
      </p>
      <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">{name}</h2>
    </section>
  );
}
