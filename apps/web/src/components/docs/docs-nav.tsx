export type DocsSlug =
  | "introduction"
  | "installation"
  | "getting-started"
  | "commands"
  | "the-guard"
  | "what-arven-detects"
  | "ci-integration"
  | "faq";

export type DocsNavItem = {
  label: string;
  slug: DocsSlug;
  href: string;
};

export type DocsNavGroup = {
  title: string;
  items: DocsNavItem[];
};

export const docsNavGroups: DocsNavGroup[] = [
  {
    title: "Getting Started",
    items: [
      { label: "Introduction", slug: "introduction", href: "/docs/introduction" },
      { label: "Installation", slug: "installation", href: "/docs/installation" },
      { label: "Getting Started", slug: "getting-started", href: "/docs/getting-started" },
    ],
  },
  {
    title: "Reference",
    items: [
      { label: "Commands", slug: "commands", href: "/docs/commands" },
      { label: "The Guard", slug: "the-guard", href: "/docs/the-guard" },
      { label: "What arven Detects", slug: "what-arven-detects", href: "/docs/what-arven-detects" },
      { label: "CI Integration", slug: "ci-integration", href: "/docs/ci-integration" },
      { label: "FAQ", slug: "faq", href: "/docs/faq" },
    ],
  },
];
