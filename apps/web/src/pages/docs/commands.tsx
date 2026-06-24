import { DocsLayout } from "../../components/docs/docs-layout";
import { DocsCodeBlock, DocsSection } from "../../components/docs/docs-primitives";
import type { DocsSlug } from "../../components/docs/docs-nav";

const toc = [
  { label: "arven init", href: "#init" },
  { label: "arven generate", href: "#generate" },
  { label: "arven check", href: "#check" },
  { label: "arven diff", href: "#diff" },
  { label: "arven uninstall", href: "#uninstall" },
];

export function CommandsPage() {
  const activeSlug: DocsSlug = "commands";

  return (
    <DocsLayout activeSlug={activeSlug} toc={toc}>
      <div className="space-y-12">
        <header className="space-y-3">
          <p className="text-sm text-zinc-400">Commands</p>
          <h1 className="text-2xl font-normal tracking-[-0.04em] text-zinc-900 sm:text-3xl">
            Command reference
          </h1>
        </header>

        <DocsSection id="init" title="arven init">
          <p>Install the hook and generate initial .env.example in one step.</p>
          <DocsCodeBlock>{`arven init
arven init --overwrite        # replace existing .env.example
arven init -o .env.sample     # custom output path`}</DocsCodeBlock>
        </DocsSection>

        <DocsSection id="generate" title="arven generate">
          <p>
            Scan the full codebase and write .env.example. Use this to regenerate after adding many
            new vars at once.
          </p>
          <DocsCodeBlock>{`arven generate
arven generate --overwrite
arven generate -o .env.sample
arven generate -r ./packages/api   # scan a specific subdirectory`}</DocsCodeBlock>
          <div className="overflow-hidden rounded-lg border border-zinc-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-normal">Flag</th>
                  <th className="px-4 py-3 font-normal">Default</th>
                  <th className="px-4 py-3 font-normal">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                <tr>
                  <td className="px-4 py-3 font-mono">-o, --output</td>
                  <td className="px-4 py-3 font-mono">.env.example</td>
                  <td className="px-4 py-3">Output file path</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono">-r, --root</td>
                  <td className="px-4 py-3 font-mono">.</td>
                  <td className="px-4 py-3">Root directory to scan</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono">--overwrite</td>
                  <td className="px-4 py-3 font-mono">false</td>
                  <td className="px-4 py-3">Overwrite existing file</td>
                </tr>
              </tbody>
            </table>
          </div>
        </DocsSection>

        <DocsSection id="check" title="arven check">
          <p>CI mode. Exits 1 if .env.example is out of sync with the codebase.</p>
          <DocsCodeBlock>{`arven check
arven check -e .env.sample    # custom .env.example path`}</DocsCodeBlock>
          <DocsCodeBlock>{`arven ✕  2 variables missing from .env.example:
  - STRIPE_SECRET_KEY
  - RESEND_API_KEY

Run: arven generate --overwrite to fix.`}</DocsCodeBlock>
        </DocsSection>

        <DocsSection id="diff" title="arven diff">
          <p>See what's missing or stale without writing any files.</p>
          <DocsCodeBlock>{`arven diff`}</DocsCodeBlock>
          <DocsCodeBlock>{`Missing in .env.example (in code, not documented):
  + STRIPE_SECRET_KEY    ← src/payments/stripe.ts

Unused in .env.example (documented, not in code):
  - OLD_LEGACY_KEY

Summary: 8 synced  1 missing  1 unused`}</DocsCodeBlock>
        </DocsSection>

        <DocsSection id="uninstall" title="arven uninstall">
          <p>Remove arven from the pre-commit hook.</p>
          <DocsCodeBlock>{`arven uninstall`}</DocsCodeBlock>
        </DocsSection>
      </div>
    </DocsLayout>
  );
}
