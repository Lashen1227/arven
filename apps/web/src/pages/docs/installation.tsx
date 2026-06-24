import { DocsLayout } from "../../components/docs/docs-layout";
import { DocsCallout, DocsCodeBlock, DocsSection } from "../../components/docs/docs-primitives";
import type { DocsSlug } from "../../components/docs/docs-nav";

const toc = [
  { label: "Requirements", href: "#requirements" },
  { label: "Global Install", href: "#global-install" },
  { label: "Without Install", href: "#without-install" },
  { label: "Verify", href: "#verify" },
];

export function InstallationPage() {
  const activeSlug: DocsSlug = "installation";

  return (
    <DocsLayout activeSlug={activeSlug} toc={toc}>
      <div className="space-y-12">
        <header className="space-y-3">
          <p className="text-sm text-zinc-400">Installation</p>
          <h1 className="text-2xl font-normal tracking-[-0.04em] text-zinc-900 sm:text-3xl">
            Install arven in minutes
          </h1>
        </header>

        <DocsSection id="requirements" title="Requirements">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm leading-6 text-blue-900">
              Node.js 18 or higher
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm leading-6 text-blue-900">
              npm / npx
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm leading-6 text-blue-900">
              A git repository
            </div>
          </div>
        </DocsSection>

        <DocsSection id="global-install" title="Global Install">
          <DocsCodeBlock>{`npm install -g arven`}</DocsCodeBlock>
        </DocsSection>

        <DocsSection id="without-install" title="Or use without installing">
          <DocsCodeBlock>{`npx arven init`}</DocsCodeBlock>
        </DocsSection>

        <DocsSection id="verify" title="Verify installation">
          <DocsCodeBlock>{`arven --version`}</DocsCodeBlock>
        </DocsSection>
      </div>
    </DocsLayout>
  );
}
