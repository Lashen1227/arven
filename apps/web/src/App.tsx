import { useEffect, useState } from "react";
import { Box, Check, ClipboardCopy, Github } from "lucide-react";

export function App() {
  const [copied, setCopied] = useState(false);
  const [stars, setStars] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const command = "npm install -g arven";
  const githubRepoUrl = "https://api.github.com/repos/Lashen1227/arven";

  const copyCommand = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  useEffect(() => {
    setMounted(true);

    const controller = new AbortController();

    const loadStars = async () => {
      try {
        const response = await fetch(githubRepoUrl, {
          signal: controller.signal,
          headers: {
            Accept: "application/vnd.github+json",
          },
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { stargazers_count?: number };
        setStars(typeof data.stargazers_count === "number" ? data.stargazers_count : null);
      } catch {
        if (!controller.signal.aborted) {
          setStars(null);
        }
      }
    };

    void loadStars();

    return () => controller.abort();
  }, []);

  return (
    <main className="min-h-screen bg-white text-zinc-500">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl text-center">
          <div
            className={`mb-6 flex items-center justify-center gap-6 text-sm text-zinc-400 transition-all duration-700 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
            style={{ transitionDelay: "0ms" }}
          >
            <span>v1.0</span>
            <span className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              9.8k
            </span>
            <span className="flex items-center gap-2">
              <Github className="h-4 w-4" /> {stars ?? "…"}
            </span>
          </div>

          <h1
            className={`text-balance text-4xl leading-tight tracking-[-0.05em] text-zinc-400 transition-all duration-700 ease-out sm:text-4xl ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "180ms" }}
          >
            Your codebase has secrets,
            <br />
            <span className="text-zinc-900">arven</span> finds them.
          </h1>

          <div
            className={`mx-auto mt-10 max-w-md transition-all duration-700 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "760ms" }}
          >
            <div className="flex items-center justify-between gap-3 rounded-sm border border-dashed border-zinc-200 bg-white px-4 py-3 text-left font-mono text-sm text-zinc-600">
              <span>{command}</span>
              <button
                type="button"
                onClick={copyCommand}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-zinc-300 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                aria-label="Copy install command"
              >
                {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div
            className={`mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-sm text-zinc-400 transition-all duration-700 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "980ms" }}
          >
            <a className="transition-colors hover:text-zinc-900" href="#docs">
              [docs]
            </a>
            <a className="transition-colors hover:text-zinc-900" href="#npm">
              [npm]
            </a>
            <a
              className="transition-colors hover:text-zinc-900"
              href="https://github.com/Lashen1227/arven"
            >
              [github]
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
