import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

import { useVersion } from "../../hooks/use-version";
import { DocsSidebar } from "./docs-sidebar";
import { DocsToc } from "./docs-toc";
import type { DocsSlug } from "./docs-nav";
import { Menu, X } from "lucide-react";

type TocItem = {
  label: string;
  href: string;
};

type DocsLayoutProps = {
  activeSlug: DocsSlug;
  toc: TocItem[];
  children: ReactNode;
};

export function DocsLayout({ activeSlug, toc, children }: DocsLayoutProps) {
  const [activeHref, setActiveHref] = useState(toc[0]?.href ?? "");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const versionQuery = useVersion();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [sidebarOpen]);

  useEffect(() => {
    const headings = toc
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((element): element is HTMLElement => element !== null);

    if (headings.length === 0) {
      return;
    }

    const updateFromHash = () => {
      const hash = window.location.hash;
      const nextHref = toc.find((item) => item.href === hash)?.href;

      if (nextHref) {
        setActiveHref(nextHref);
      }
    };

    updateFromHash();

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (!visible) {
          return;
        }

        const nextHref = `#${visible.target.id}`;
        setActiveHref(nextHref);
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    headings.forEach((heading) => observer.observe(heading));
    window.addEventListener("hashchange", updateFromHash);

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
      observer.disconnect();
      window.removeEventListener("hashchange", updateFromHash);
    };
  }, [toc]);

  return (
    <main className="min-h-screen bg-white text-zinc-700">
      <div className="grid min-h-screen lg:grid-cols-[20rem_minmax(0,1fr)_16rem]">
        <aside className="hidden border-r border-zinc-200 lg:flex lg:flex-col">
          <div className="flex h-20 items-center justify-between border-b border-zinc-200 px-5">
            <Link to="/" className="flex items-center gap-2 text-zinc-700">
              <span className="grid h-10 w-10 overflow-hidden p-1">
                <img src="/logo.png" alt="logo" className="h-full w-full object-contain" />
              </span>
              <span className="text-[1.05rem] text-zinc-500">arven/docs</span>
            </Link>
            {versionQuery.data && <span className="text-sm text-zinc-400">{versionQuery.data}</span>}
          </div>
          <DocsSidebar activeSlug={activeSlug} />
        </aside>

        <div className="min-w-0">
          <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-5 lg:hidden">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="cursor-pointer rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link to="/" className="flex items-center gap-2 text-zinc-700">
                <span className="grid h-9 w-9 overflow-hidden p-1">
                  <img src="/logo.png" alt="logo" className="h-full w-full object-contain" />
                </span>
                <span className="text-base text-zinc-500">arven/docs</span>
              </Link>
            </div>
            {versionQuery.data && <span className="text-sm text-zinc-400">{versionQuery.data}</span>}
          </header>

          <div className="px-6 py-10 sm:px-8 lg:px-16 lg:py-16">
            <div className="mx-auto max-w-3xl">{children}</div>
          </div>
        </div>

        <div className="hidden border-l border-zinc-200 lg:block">
          <DocsToc items={toc} activeHref={activeHref} />
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div
            ref={sidebarRef}
            className="absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-zinc-200 bg-white"
          >
            <div className="flex h-20 items-center justify-between border-b border-zinc-200 px-5">
              <Link to="/" className="flex items-center gap-2 text-zinc-700">
                <span className="grid h-10 w-10 overflow-hidden p-1">
                  <img src="/logo.png" alt="logo" className="h-full w-full object-contain" />
                </span>
                <span className="text-[1.05rem] text-zinc-500">arven/docs</span>
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="cursor-pointer rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div onClick={() => setSidebarOpen(false)}>
              <DocsSidebar activeSlug={activeSlug} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
