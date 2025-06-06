export function Footer() {
  const year = new Date().getFullYear();
  return (
    <div className="w-full p-1 text-xs text-muted-foreground/80 flex items-center justify-center gap-3">
      <div className="flex items-center gap-2">© {year} UniGlyphs</div>
    </div>
  );
}
