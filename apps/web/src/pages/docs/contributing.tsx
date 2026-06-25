import { Contributors } from "../../components/contributors";
import { DocsLayout } from "../../components/docs/docs-layout";
import { DocsCallout, DocsCodeBlock, DocsSection } from "../../components/docs/docs-primitives";
import type { DocsSlug } from "../../components/docs/docs-nav";

const toc = [
  { label: "Prerequisites", href: "#prerequisites" },
  { label: "Setup", href: "#setup" },
  { label: "Making Changes", href: "#making-changes" },
  { label: "Pull Request Guidelines", href: "#pull-request-guidelines" },
  { label: "Reporting Bugs", href: "#reporting-bugs" },
  { label: "Contributors", href: "#contributors" },
];

export function ContributingPage() {
  const activeSlug: DocsSlug = "contributing";

  return (
    <DocsLayout activeSlug={activeSlug} toc={toc}>
      <div className="space-y-12">
        <header className="space-y-3">
          <p className="text-sm text-zinc-400">Contributing</p>
          <h1 className="text-2xl font-normal tracking-[-0.04em] text-zinc-900 sm:text-3xl">
            Contributing to arven
          </h1>
          <p className="max-w-3xl text-[15px] leading-8 text-zinc-700">
          arven is an open-source project that welcomes contributions from everyone!
        </p>
        </header>

        <DocsSection id="prerequisites" title="Prerequisites">
          <p>Before contributing, ensure you have the following installed:</p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm leading-6 text-blue-900">
              Node.js 18 or later
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm leading-6 text-blue-900">
              npm 9 or later
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm leading-6 text-blue-900">
              Git
            </div>
          </div>
        </DocsSection>

        <DocsSection id="setup" title="Setting Up the Development Environment">
          <ol className="space-y-4 pl-6">
            <li>Fork the repository to your GitHub account.</li>
            <li>
              Clone your fork:
              <DocsCodeBlock>{`git clone https://github.com/<your-username>/arven.git
cd arven`}</DocsCodeBlock>
            </li>
            <li>
              Install dependencies:
              <DocsCodeBlock>{`npm install`}</DocsCodeBlock>
            </li>
            <li>
              Build the project:
              <DocsCodeBlock>{`npm run build`}</DocsCodeBlock>
            </li>
            <li>
              Run in development mode (watches for changes):
              <DocsCodeBlock>{`npm run dev`}</DocsCodeBlock>
            </li>
            <li>
              Run all tests:
              <DocsCodeBlock>{`npm test`}</DocsCodeBlock>
            </li>
          </ol>
        </DocsSection>

        <DocsSection id="making-changes" title="Making Changes">
          <ol className="space-y-4 pl-6">
            <li>
              Create a new branch from the latest main branch:
              <DocsCodeBlock>{`git checkout -b feature/my-new-feature`}</DocsCodeBlock>
            </li>
            <li>Make your changes.</li>
            <li>
              Run tests and verify functionality:
              <DocsCodeBlock>{`npm test
npm run build`}</DocsCodeBlock>
            </li>
            <li>
              Commit your changes using a clear commit message:
              <DocsCodeBlock>{`git commit -m "feat: add Bun environment variable detection"`}</DocsCodeBlock>
            </li>
            <li>
              Push your branch and open a Pull Request against <code className="rounded bg-zinc-100 px-1.5 py-0.5">main</code>.
            </li>
          </ol>
        </DocsSection>

        <DocsSection id="pull-request-guidelines" title="Pull Request Guidelines">
          <p>Before submitting a pull request, please ensure:</p>
          <ul className="space-y-3 pl-6">
            <li>The code builds successfully.</li>
            <li>Ensure all tests pass.</li>
            <li>Documentation is updated when necessary.</li>
            <li>Changes are focused on a single feature or fix.</li>
            <li>Commit messages are descriptive and meaningful.</li>
            <li>Existing functionality is not broken.</li>
          </ul>
          <div className="grid gap-4 md:grid-cols-2">
            <DocsCallout>
              <p className="mb-2 font-medium text-zinc-900">Good examples</p>
              <p className="font-mono text-sm">feat: add Bun detection</p>
              <p className="font-mono text-sm">fix: prevent duplicate vars</p>
              <p className="font-mono text-sm">docs: improve install guide</p>
              <p className="font-mono text-sm">refactor: simplify parser</p>
            </DocsCallout>
            <DocsCallout>
              <p className="mb-2 font-medium text-zinc-900">Avoid</p>
              <p className="font-mono text-sm">update stuff</p>
              <p className="font-mono text-sm">fix bug</p>
              <p className="font-mono text-sm">changes</p>
              <p className="font-mono text-sm">misc updates</p>
            </DocsCallout>
          </div>
        </DocsSection>

        <DocsSection id="reporting-bugs" title="Reporting Bugs">
          <p>
            If you discover a bug, please create an issue and include a clear description,
            steps to reproduce, expected vs actual behavior, and your environment details
            (OS, Node.js version, arven version).
          </p>
          <p>
            Feature requests, documentation contributions, and code style improvements
            are all welcome. When in doubt, open an{" "}
            <a
              href="https://github.com/Lashen1227/arven/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-dotted underline-offset-2 hover:decoration-solid active:decoration-solid text-zinc-800"
            >
              issue
            </a>{" "}
            or{" "}
            <a
              href="https://github.com/Lashen1227/arven/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-dotted underline-offset-2 hover:decoration-solid active:decoration-solid text-zinc-800"
            >
              discussion
            </a>{" "}
            before investing significant development time.
          </p>
        </DocsSection>

        <DocsSection id="contributors" title="Contributors">
          <p>
            Every commit, bug report & doc improvement matters. Thank you everyone who has contributed to arven.
            Your help makes this project better ✨
          </p>
          <Contributors />
        </DocsSection>
      </div>
    </DocsLayout>
  );
}
