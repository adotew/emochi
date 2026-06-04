type CurrentPlayerProps = {
  name: string;
};

export function CurrentPlayer({ name }: CurrentPlayerProps) {
  return (
    <section className="rounded-3xl border border-[hsl(var(--border))] bg-surface px-6 py-5 text-center shadow-sm">
      <p className="text-sm font-medium text-muted">
        Aktueller Spieler
      </p>
      <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">{name}</h2>
    </section>
  );
}
