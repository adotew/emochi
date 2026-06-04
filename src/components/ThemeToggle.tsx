type ThemeToggleProps = {
  theme: "light" | "dark";
  onToggle: () => void;
};

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-full border border-[hsl(var(--border))] bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-surfaceStrong"
      aria-label="Farbschema wechseln"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
