import { DocsLayout } from "../../components/docs/docs-layout";
import { DocsCallout, DocsSection } from "../../components/docs/docs-primitives";
import type { DocsSlug } from "../../components/docs/docs-nav";

const toc = [
  { label: "Supported syntaxes", href: "#supported-syntaxes" },
  { label: "File types", href: "#file-types" },
  { label: "Built-ins", href: "#built-ins" },
];

export function WhatArvenDetectsPage() {
  const activeSlug: DocsSlug = "what-arven-detects";

  return (
    <DocsLayout activeSlug={activeSlug} toc={toc}>
      <div className="space-y-12">
        <header className="space-y-3">
          <p className="text-sm text-zinc-400">Reference</p>
          <h1 className="text-2xl font-normal tracking-[-0.04em] text-zinc-900 sm:text-3xl">
            What arven detects
          </h1>
        </header>

        <DocsSection id="supported-syntaxes" title="Supported syntaxes">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["process.env.VAR", "Node.js, Express, NestJS"],
              ["process.env['VAR']", "Node.js bracket notation"],
              ["import.meta.env.VAR", "Vite, SvelteKit, Next.js"],
              ["Deno.env.get('VAR')", "Deno"],
              ["Bun.env.VAR", "Bun"],
            ].map(([syntax, framework]) => (
              <DocsCallout key={syntax}>
                <div className="space-y-1">
                  <p className="font-mono text-zinc-900">{syntax}</p>
                  <p>{framework}</p>
                </div>
              </DocsCallout>
            ))}
          </div>
        </DocsSection>

        <DocsSection id="file-types" title="Supported file types">
          <DocsCallout>.ts .tsx .js .jsx .mjs .cjs .vue .svelte</DocsCallout>
        </DocsSection>

        <DocsSection id="built-ins" title="Auto-excluded built-ins">
          <p>
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">NODE_ENV</code>,
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">PATH</code>,
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">HOME</code>,
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">CI</code>,
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">TZ</code>,
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">SHELL</code>
            and other system variables are filtered automatically. They never appear in the
            generated .env.example.
          </p>
        </DocsSection>
      </div>
    </DocsLayout>
  );
}
