import { DocsLayout } from "../../components/docs/docs-layout";
import { DocsCodeBlock, DocsSection } from "../../components/docs/docs-primitives";
import type { DocsSlug } from "../../components/docs/docs-nav";

const toc = [
  { label: "GitHub Actions", href: "#github-actions" },
  { label: "GitLab CI", href: "#gitlab-ci" },
  { label: "Recommended setup", href: "#recommended-setup" },
];

export function CiIntegrationPage() {
  const activeSlug: DocsSlug = "ci-integration";

  return (
    <DocsLayout activeSlug={activeSlug} toc={toc}>
      <div className="space-y-12">
        <header className="space-y-3">
          <p className="text-sm text-zinc-400">Reference</p>
          <h1 className="text-2xl font-normal tracking-[-0.04em] text-zinc-900 sm:text-3xl">
            CI Integration
          </h1>
        </header>

        <DocsSection id="github-actions" title="GitHub Actions">
          <DocsCodeBlock>{`name: CI
on: [push, pull_request]

jobs:
  env-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx arven check`}</DocsCodeBlock>
        </DocsSection>

        <DocsSection id="gitlab-ci" title="GitLab CI">
          <DocsCodeBlock>{`env-check:
  script:
    - npx arven check`}</DocsCodeBlock>
        </DocsSection>

        <DocsSection id="recommended-setup" title="Recommended setup">
          <DocsCodeBlock>{`Local (git hook)     →  catches issues before they're committed
CI (arven check)     →  catches anything that slipped through --no-verify`}</DocsCodeBlock>
        </DocsSection>
      </div>
    </DocsLayout>
  );
}
