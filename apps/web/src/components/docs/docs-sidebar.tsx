import { ChevronDown } from "lucide-react";
import { NavLink } from "react-router-dom";

import { docsNavGroups, type DocsSlug } from "./docs-nav";

type DocsSidebarProps = {
  activeSlug: DocsSlug;
};

export function DocsSidebar({ activeSlug }: DocsSidebarProps) {
  return (
    <nav className="flex flex-1 flex-col">
      {docsNavGroups.map((group) => (
        <div key={group.title} className="border-b border-zinc-200">
          <div className="flex items-center justify-between px-5 py-4 text-sm text-zinc-900">
            <span>{group.title}</span>
            <ChevronDown className="h-4 w-4" />
          </div>
          <div className="space-y-1 px-3 pb-4">
            {group.items.map((item) => {
              const isActive = item.slug === activeSlug;

              return (
                <NavLink
                  key={item.slug}
                  to={item.href}
                  className={({ isActive: linkActive }) =>
                    [
                      "block rounded-md px-3 py-2 text-sm transition-colors",
                      linkActive || isActive
                        ? "bg-zinc-100 text-zinc-900"
                        : "text-zinc-500 hover:text-zinc-900",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
