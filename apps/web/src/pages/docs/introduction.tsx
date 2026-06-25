import { DocsLayout } from "../../components/docs/docs-layout";
import { DocsCallout, DocsCodeBlock, DocsSection } from "../../components/docs/docs-primitives";
import type { DocsSlug } from "../../components/docs/docs-nav";

const toc = [
  { label: "Why arven?", href: "#why-arven" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
];

export function IntroductionPage() {
  const activeSlug: DocsSlug = "introduction";

  return (
    <DocsLayout activeSlug={activeSlug} toc={toc}>
      <div className="space-y-12">
        <header className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">Introduction</p>
            <h1 className="text-2xl font-normal tracking-[-0.04em] text-zinc-900 sm:text-3xl">
              What is arven?
            </h1>
          </div>
          <p className="max-w-3xl text-[15px] leading-8 text-zinc-700">
            From the Welsh <em>arven</em>, meaning "to oversee" or "to keep watch," arven watches
            over your env vars so you never forget to document them. It scans your codebase,
            auto-generates a documented{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">.env.example</code>, and silently
            guards every git commit, blocking it the moment a new env var goes undocumented.
          </p>
        </header>

        <DocsSection id="why-arven" title="Why arven?">
          <p>
            You add{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">process.env.STRIPE_SECRET_KEY</code>{" "}
            in a late-night coding session. You commit and push. Next day, a teammate clones and
            spends 40 minutes debugging why the app crashes.
          </p>
          <p>
            The <code className="rounded bg-zinc-100 px-1.5 py-0.5">.env.example</code> was never
            updated.
          </p>
          <p>
            arven fixes this permanently. Not with a checklist. Not with a convention. With a git
            hook that never forgets.
          </p>
        </DocsSection>

        <DocsSection id="how-it-works" title="How It Works">
          <DocsCodeBlock>{`# Run once in your project
arven init

# From now on, every commit is guarded automatically
git commit -m "feat: add stripe payments"

# arven ✕ Commit blocked
# STRIPE_SECRET_KEY found in staged files but not in .env.example`}</DocsCodeBlock>
        </DocsSection>

        <DocsSection id="features" title="Features">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              "Zero config - one command to set up, works forever",
              "Staged-only scanning - only checks files in the current commit, stays fast",
              "Auto-grouped output - vars sorted into Database, Auth, Payments, AI and more",
              "CI ready - `arven check` fails the build if `.env.example` drifts",
              "Works everywhere - VS Code, IntelliJ, GitHub Desktop, terminal, any git interface",
              "Safe with other tools - appends to existing hooks, never overwrites husky or lefthook",
            ].map((item) => (
              <DocsCallout key={item}>{item}</DocsCallout>
            ))}
          </div>
        </DocsSection>
      </div>
    </DocsLayout>
  );
}
