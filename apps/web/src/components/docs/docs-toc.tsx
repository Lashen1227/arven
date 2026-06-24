type DocsTocItem = {
  label: string;
  href: string;
};

type DocsTocProps = {
  items: DocsTocItem[];
  activeHref: string;
};

export function DocsToc({ items, activeHref }: DocsTocProps) {
  return (
    <aside className="sticky top-0 pt-24">
      <div className="space-y-5 border-l border-zinc-200 pl-6">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span className="text-zinc-300">☰</span>
          On this page
        </div>
        <nav className="space-y-3 text-sm text-zinc-500">
          {items.map((item) => (
            <a
              key={item.href}
              className={[
                "block transition-colors",
                activeHref === item.href ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-900",
              ].join(" ")}
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
