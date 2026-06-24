import { DocsLayout } from "../../components/docs/docs-layout";
import { DocsCodeBlock, DocsSection } from "../../components/docs/docs-primitives";
import type { DocsSlug } from "../../components/docs/docs-nav";

const toc = [
  { label: "Env values", href: "#env-values" },
  { label: "Monorepos", href: "#monorepos" },
  { label: "Removal", href: "#removal" },
];

export function FAQPage() {
  const activeSlug: DocsSlug = "faq";

  return (
    <DocsLayout activeSlug={activeSlug} toc={toc}>
      <div className="space-y-12">
        <header className="space-y-3">
          <p className="text-sm text-zinc-400">FAQ</p>
        </header>

        <DocsSection id="env-values" title="Does arven store or send my env values?">
          <p>
            No. arven only reads variable names from source code, never values. It never reads your
            actual .env file.
          </p>
        </DocsSection>

        <DocsSection id="husky-hook" title="What if I already have a pre-commit hook from husky?">
          <p>
            arven appends to the existing hook file rather than replacing it. Both tools coexist
            safely.
          </p>
        </DocsSection>

        <DocsSection id="env-example" title="What if .env.example doesn't exist yet?">
          <p>
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">arven init</code> creates it. If you
            run <code className="rounded bg-zinc-100 px-1.5 py-0.5">arven guard</code> before
            generating one, it warns but doesn't block.
          </p>
        </DocsSection>

        <DocsSection id="monorepos" title="Can I use arven in a monorepo?">
          <p>Yes. Use the -r flag to point arven at a specific package directory.</p>
          <DocsCodeBlock>{`arven generate -r ./packages/api -o ./packages/api/.env.example`}</DocsCodeBlock>
        </DocsSection>

        <DocsSection id="removal" title="How do I remove arven completely?">
          <DocsCodeBlock>{`arven uninstall   # removes the hook
npm uninstall -g arven`}</DocsCodeBlock>
        </DocsSection>

        <DocsSection id="no-verify" title="Does arven work with git commit --no-verify?">
          <p>
            The hook is bypassed. This is a git feature, not an arven limitation. Use
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">arven check</code> in CI as your
            safety net.
          </p>
        </DocsSection>
      </div>
    </DocsLayout>
  );
}
