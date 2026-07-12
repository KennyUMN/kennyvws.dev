export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-surface-muted px-3 py-1 text-[13px] font-medium text-ink-muted">
      {children}
    </span>
  );
}
