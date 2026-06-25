import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useVersion } from "../hooks/use-version";
import { useNpmDownloads } from "../hooks/use-npm-downloads";
import { Box, Check, Copy, Github } from "lucide-react";
import { Link } from "react-router-dom";

export function HomePage() {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const command = "npm install -g arven";

  const versionQuery = useVersion();
  const npmDownloadsQuery = useNpmDownloads();

  const starsQuery = useQuery({
    queryKey: ["github-stars", "Lashen1227", "arven"],
    queryFn: async () => {
      const response = await fetch("https://api.github.com/repos/Lashen1227/arven", {
        headers: {
          Accept: "application/vnd.github+json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load GitHub stars");
      }

      const data = (await response.json()) as { stargazers_count?: number };
      return typeof data.stargazers_count === "number" ? data.stargazers_count : null;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const copyCommand = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-white text-zinc-500">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl text-center">
          <div
            className={`mb-4 flex items-center justify-center gap-6 text-sm text-zinc-400 transition-all duration-700 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
            style={{ transitionDelay: "0ms" }}
          >
            {versionQuery.data && <span>{versionQuery.data} 🎉</span>}
            {/* {npmDownloadsQuery.data && (
              <span className="flex items-center gap-1">
                <Box className="h-4 w-4" />
                {npmDownloadsQuery.data}
              </span>
            )} */}

            {/* {starsQuery.data && (
              <span className="flex items-center gap-1">
                <Github className="h-4 w-4" /> {starsQuery.data}
              </span>
            )} */}
          </div>

          <h1
            className={`text-balance text-2xl leading-tight tracking-[-0.05em] text-zinc-400 transition-all duration-700 ease-out sm:text-3xl ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "180ms" }}
          >
            Your codebase has secrets,
            <br />
            <span className="text-zinc-900">arven</span> finds them.
          </h1>

          <div
            className={`mx-auto mt-7 max-w-xs transition-all duration-700 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "760ms" }}
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-0 rounded-sm border border-dashed border-zinc-300 bg-white px-7 py-2 text-left font-mono text-xs text-zinc-700">
              <span>{command}</span>
              <button
                type="button"
                onClick={copyCommand}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm text-zinc-400 transition-colors hover:border-zinc-300 hover:text-zinc-900"
                aria-label="Copy install command"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div
            className={`mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-sm text-zinc-400 transition-all duration-700 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "980ms" }}
          >
            <Link className="transition-colors hover:text-zinc-900" to="/docs/introduction">
              [docs]
            </Link>
            <a
              className="transition-colors hover:text-zinc-900"
              href="https://www.npmjs.com/package/arven"
            >
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
