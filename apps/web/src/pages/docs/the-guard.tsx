import { DocsLayout } from "../../components/docs/docs-layout";
import { DocsCodeBlock, DocsSection } from "../../components/docs/docs-primitives";
import type { DocsSlug } from "../../components/docs/docs-nav";

const toc = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Blocked commit", href: "#blocked-commit" },
  { label: "Works everywhere", href: "#works-everywhere" },
  { label: "Bypassing the hook", href: "#bypassing" },
];

export function TheGuardPage() {
  const activeSlug: DocsSlug = "the-guard";

  return (
    <DocsLayout activeSlug={activeSlug} toc={toc}>
      <div className="space-y-12">
        <header className="space-y-3">
          <p className="text-sm text-zinc-400">Reference</p>
          <h1 className="text-2xl font-normal tracking-[-0.04em] text-zinc-900 sm:text-3xl">
            The Guard
          </h1>
        </header>

        <DocsSection id="how-it-works" title="How it works">
          <p>
            When you run <code className="rounded bg-zinc-100 px-1.5 py-0.5">git commit</code>, the
            pre-commit hook fires automatically. arven scans only the staged files in that commit,
            checking if any new{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">process.env.X</code>
            or <code className="rounded bg-zinc-100 px-1.5 py-0.5">import.meta.env.X</code>{" "}
            references are missing from{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">.env.example</code>.
          </p>
          <p>On a clean commit, arven stays silent.</p>
        </DocsSection>

        <DocsSection id="blocked-commit" title="On a blocked commit">
          <DocsCodeBlock>{`arven ✕  Commit blocked

1 new env var found in staged files but not in .env.example:

  ✕ STRIPE_SECRET_KEY     ← src/payments/stripe.ts

Fix with one of:
  arven generate --overwrite   # auto-add to .env.example
  arven diff                   # see full picture

Then re-commit.`}</DocsCodeBlock>
          <DocsCodeBlock>{`arven generate --overwrite
git add .env.example
git commit -m "feat: add stripe payments"`}</DocsCodeBlock>
        </DocsSection>

        <DocsSection id="works-everywhere" title="Works across all git interfaces">
          <div className="overflow-hidden rounded-lg border border-zinc-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-normal">Tool</th>
                  <th className="px-4 py-3 font-normal">Guarded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {[
                  "Terminal",
                  "VS Code Source Control",
                  "IntelliJ / WebStorm",
                  "GitHub Desktop",
                  "Fork / Tower",
                ].map((tool) => (
                  <tr key={tool}>
                    <td className="px-4 py-3">{tool}</td>
                    <td className="px-4 py-3">Yes</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DocsSection>

        <DocsSection id="bypassing" title="Bypassing the hook">
          <DocsCodeBlock>{`git commit --no-verify   # skips all hooks including arven`}</DocsCodeBlock>
          <p>
            For full protection, pair arven with{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">arven check</code> in CI. That
            catches anything <code className="rounded bg-zinc-100 px-1.5 py-0.5">--no-verify</code>{" "}
            lets through.
          </p>
        </DocsSection>
      </div>
    </DocsLayout>
  );
}
